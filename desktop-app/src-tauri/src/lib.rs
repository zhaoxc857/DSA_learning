use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use std::collections::BTreeMap;
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Mutex, OnceLock};
use std::thread;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};
use tauri::Manager;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

const COMPILE_TIMEOUT_SECS: u64 = 25;
const RUN_TIMEOUT_SECS: u64 = 8;
const OJ_CASE_TIMEOUT_SECS: u64 = 3;
const TEST_KIT_HEADER: &str = include_str!("../resources/test_kit.h");

const LAB_FOLDERS: &[(&str, &str)] = &[
    ("00", "00_指针与结构体热身"),
    ("01", "01_复杂度与字符统计"),
    ("02", "02_顺序表手写"),
    ("03", "03_单链表手写"),
    ("04", "04_双链表与约瑟夫环"),
    ("05", "05_栈与循环队列"),
    ("06", "06_KMP与递归回溯"),
    ("07", "07_二叉树手写"),
    ("08", "08_哈夫曼编码"),
    ("09", "09_图遍历与最短路"),
    ("10", "10_查找与哈希表"),
    ("11", "11_手写核心排序"),
    ("12", "12_静态链表与稀疏矩阵"),
    ("13", "13_图的进阶算法"),
    ("14", "14_全书终极盲写大考"),
];

static PROGRESS_LOCK: OnceLock<Mutex<()>> = OnceLock::new();
static TEMP_COUNTER: AtomicU64 = AtomicU64::new(1);

fn progress_lock() -> &'static Mutex<()> {
    PROGRESS_LOCK.get_or_init(|| Mutex::new(()))
}

#[derive(Debug, Clone)]
struct GppInfo {
    found: bool,
    command: String,
    version: String,
    bin_dir: Option<PathBuf>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthResponse {
    pub ok: bool,
    pub mode: String,
    pub gpp: bool,
    pub gpp_version: String,
    pub labs_count: usize,
    pub can_shutdown: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct JudgeCase {
    pub status: String,
    pub name: String,
    pub expected: String,
    pub actual: String,
    pub hint: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct JudgeResult {
    pub ok: bool,
    pub compile_ok: bool,
    pub compile_error: String,
    pub warnings: String,
    pub timed_out: bool,
    pub crashed: bool,
    pub exit_code: i32,
    pub passed: usize,
    pub total: usize,
    pub cases: Vec<JudgeCase>,
    pub raw_output: String,
    pub saved_to_disk: bool,
    pub save_error: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DemoResult {
    pub compile_ok: bool,
    pub compile_error: String,
    pub timed_out: bool,
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OjTestCase {
    #[serde(default)]
    pub label: String,
    #[serde(default)]
    pub input: String,
    #[serde(default)]
    pub expected: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OjCaseResult {
    pub index: usize,
    pub label: String,
    pub status: String,
    pub input: String,
    pub expected: String,
    pub actual: String,
    pub time_ms: u64,
    pub error: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OjJudgeResult {
    pub ok: bool,
    pub compile_ok: bool,
    pub verdict: String,
    pub compile_error: String,
    pub warnings: String,
    pub passed: usize,
    pub total: usize,
    pub cases: Vec<OjCaseResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ProgressEntry {
    status: String,
    passed: usize,
    total: usize,
    updated: String,
}

struct TempDirGuard {
    path: PathBuf,
}

impl TempDirGuard {
    fn new(prefix: &str) -> std::io::Result<Self> {
        let base = std::env::temp_dir();
        let pid = std::process::id();
        let seq = TEMP_COUNTER.fetch_add(1, Ordering::Relaxed);
        let ts = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis();
        let path = base.join(format!("{prefix}_{pid}_{ts}_{seq}"));
        fs::create_dir_all(&path)?;
        Ok(Self { path })
    }

    fn path(&self) -> &Path {
        &self.path
    }
}

impl Drop for TempDirGuard {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

struct ExecOutput {
    timed_out: bool,
    exit_code: i32,
    stdout: String,
    stderr: String,
    elapsed_ms: u64,
}

fn configure_no_window(cmd: &mut Command) {
    #[cfg(windows)]
    {
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
}

fn prepend_bin_dir_to_path(cmd: &mut Command, bin_dir: Option<&Path>) {
    if let Some(dir) = bin_dir {
        let sep = if cfg!(windows) { ";" } else { ":" };
        let current = std::env::var_os("PATH").unwrap_or_default();
        let mut combined = dir.as_os_str().to_os_string();
        if !current.is_empty() {
            combined.push(sep);
            combined.push(current);
        }
        cmd.env("PATH", combined);
    }
}

fn run_command_with_timeout(
    cmd: &mut Command,
    timeout: Duration,
    stdin_data: Option<&str>,
) -> Result<ExecOutput, std::io::Error> {
    configure_no_window(cmd);
    if stdin_data.is_some() {
        cmd.stdin(Stdio::piped());
    } else {
        cmd.stdin(Stdio::null());
    }
    cmd.stdout(Stdio::piped()).stderr(Stdio::piped());

    let start = Instant::now();
    let mut child = cmd.spawn()?;

    let in_handle = if let Some(input_str) = stdin_data {
        let input_bytes = input_str.as_bytes().to_vec();
        let stdin_pipe = child.stdin.take();
        Some(thread::spawn(move || {
            if let Some(mut pipe) = stdin_pipe {
                let _ = pipe.write_all(&input_bytes);
                let _ = pipe.flush();
                // pipe 在此作用域结束时自动关闭，向子进程发送 EOF
            }
        }))
    } else {
        None
    };

    let mut stdout_pipe = child.stdout.take();
    let mut stderr_pipe = child.stderr.take();

    let out_handle = thread::spawn(move || {
        let mut buf = Vec::new();
        if let Some(ref mut pipe) = stdout_pipe {
            let _ = pipe.read_to_end(&mut buf);
        }
        buf
    });

    let err_handle = thread::spawn(move || {
        let mut buf = Vec::new();
        if let Some(ref mut pipe) = stderr_pipe {
            let _ = pipe.read_to_end(&mut buf);
        }
        buf
    });

    let deadline = start + timeout;
    let mut timed_out = false;
    let exit_code;

    loop {
        match child.try_wait()? {
            Some(status) => {
                exit_code = status.code().unwrap_or(-1);
                break;
            }
            None => {
                if Instant::now() >= deadline {
                    timed_out = true;
                    let _ = child.kill();
                    let _ = child.wait();
                    exit_code = -1;
                    break;
                }
                thread::sleep(Duration::from_millis(12));
            }
        }
    }

    let elapsed_ms = start.elapsed().as_millis() as u64;
    if let Some(h) = in_handle {
        let _ = h.join();
    }
    let stdout_bytes = out_handle.join().unwrap_or_default();
    let stderr_bytes = err_handle.join().unwrap_or_default();

    Ok(ExecOutput {
        timed_out,
        exit_code,
        stdout: String::from_utf8_lossy(&stdout_bytes).into_owned(),
        stderr: String::from_utf8_lossy(&stderr_bytes).into_owned(),
        elapsed_ms,
    })
}

fn probe_gpp_binary(program: &str, bin_dir: Option<PathBuf>) -> Option<GppInfo> {
    let mut cmd = Command::new(program);
    cmd.arg("--version");
    prepend_bin_dir_to_path(&mut cmd, bin_dir.as_deref());

    let out = run_command_with_timeout(&mut cmd, Duration::from_secs(5), None).ok()?;
    if out.timed_out || out.exit_code != 0 {
        return None;
    }
    let version = out
        .stdout
        .lines()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .unwrap_or("g++")
        .to_string();

    Some(GppInfo {
        found: true,
        command: program.to_string(),
        version,
        bin_dir,
    })
}

fn candidate_gpp_paths() -> Vec<PathBuf> {
    let mut paths = Vec::new();
    if cfg!(windows) {
        if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
            let base = PathBuf::from(local_app_data);
            paths.push(base.join("Programs\\msys64\\ucrt64\\bin\\g++.exe"));
            paths.push(base.join("Programs\\msys64\\mingw64\\bin\\g++.exe"));
        }
        paths.push(PathBuf::from(r"C:\msys64\ucrt64\bin\g++.exe"));
        paths.push(PathBuf::from(r"C:\msys64\mingw64\bin\g++.exe"));
        paths.push(PathBuf::from(r"C:\mingw64\bin\g++.exe"));
        paths.push(PathBuf::from(r"C:\MinGW\bin\g++.exe"));
        paths.push(PathBuf::from(r"C:\Program Files (x86)\Dev-Cpp\MinGW64\bin\g++.exe"));
        paths.push(PathBuf::from(r"C:\Program Files\Dev-Cpp\MinGW64\bin\g++.exe"));
        paths.push(PathBuf::from(r"C:\TDM-GCC-64\bin\g++.exe"));
        if let Ok(user_profile) = std::env::var("USERPROFILE") {
            paths.push(PathBuf::from(user_profile).join("scoop\\shims\\g++.exe"));
        }
    }
    paths
}

fn detect_gpp_info() -> GppInfo {
    if let Some(info) = probe_gpp_binary("g++", None) {
        return info;
    }

    for candidate in candidate_gpp_paths() {
        if candidate.is_file() {
            let bin_dir = candidate.parent().map(Path::to_path_buf);
            if let Some(cmd_str) = candidate.to_str() {
                if let Some(info) = probe_gpp_binary(cmd_str, bin_dir) {
                    return info;
                }
            }
        }
    }

    GppInfo {
        found: false,
        command: String::new(),
        version: String::new(),
        bin_dir: None,
    }
}

fn find_local_labs_dir() -> Option<PathBuf> {
    let mut roots = Vec::new();
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            roots.push(parent.to_path_buf());
        }
    }
    if let Ok(cwd) = std::env::current_dir() {
        roots.push(cwd);
    }

    for root in roots {
        let mut cursor = Some(root.as_path());
        for _ in 0..6 {
            if let Some(dir) = cursor {
                let candidate = dir.join("labs");
                if candidate.join("common").join("test_kit.h").is_file()
                    || candidate.join("00_指针与结构体热身").is_dir()
                {
                    return Some(candidate);
                }
                cursor = dir.parent();
            } else {
                break;
            }
        }
    }
    None
}

fn resolve_progress_path(app: Option<&tauri::AppHandle>) -> Option<PathBuf> {
    if let Some(labs_dir) = find_local_labs_dir() {
        return Some(labs_dir.join(".progress.json"));
    }
    if let Some(handle) = app {
        if let Ok(data_dir) = handle.path().app_data_dir() {
            return Some(data_dir.join("progress.json"));
        }
    }
    None
}

fn now_iso_timestamp() -> String {
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let days = secs.div_euclid(86_400);
    let rem = secs.rem_euclid(86_400);
    let hour = rem / 3600;
    let minute = (rem % 3600) / 60;
    let second = rem % 60;

    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = (z - era * 146_097) as u64;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe as i64 + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = if m <= 2 { y + 1 } else { y };

    format!("{year:04}-{m:02}-{d:02}T{hour:02}:{minute:02}:{second:02}Z")
}

fn write_progress_map_atomic(file_path: &Path, prog: &BTreeMap<String, Value>) {
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let tmp_path = file_path.with_extension("json.tmp");
    if let Ok(serialized) = serde_json::to_string_pretty(prog) {
        if fs::write(&tmp_path, serialized).is_ok() {
            if fs::rename(&tmp_path, file_path).is_err() {
                let _ = fs::copy(&tmp_path, file_path);
                let _ = fs::remove_file(&tmp_path);
            }
        }
    }
}

fn load_progress_from_path(path: Option<&Path>) -> Value {
    let _guard = progress_lock().lock().unwrap_or_else(|e| e.into_inner());
    let Some(file_path) = path else {
        return Value::Object(Map::new());
    };
    if !file_path.is_file() {
        return Value::Object(Map::new());
    }
    match fs::read_to_string(file_path) {
        Ok(content) => match serde_json::from_str::<Value>(&content) {
            Ok(Value::Object(map)) => Value::Object(map),
            _ => Value::Object(Map::new()),
        },
        Err(_) => Value::Object(Map::new()),
    }
}

fn update_progress_at_path(
    path: Option<&Path>,
    lab_id: &str,
    status: &str,
    passed: usize,
    total: usize,
) {
    let _guard = progress_lock().lock().unwrap_or_else(|e| e.into_inner());
    let Some(file_path) = path else {
        return;
    };

    let mut prog: BTreeMap<String, Value> = if file_path.is_file() {
        fs::read_to_string(file_path)
            .ok()
            .and_then(|s| serde_json::from_str::<BTreeMap<String, Value>>(&s).ok())
            .unwrap_or_default()
    } else {
        BTreeMap::new()
    };

    let entry = ProgressEntry {
        status: status.to_string(),
        passed,
        total,
        updated: now_iso_timestamp(),
    };
    if let Ok(val) = serde_json::to_value(entry) {
        prog.insert(lab_id.to_string(), val);
    }

    write_progress_map_atomic(file_path, &prog);
}

fn record_oj_passed_at_path(path: Option<&Path>, problem_id: &str) {
    let pid = problem_id.trim();
    if pid.is_empty() {
        return;
    }
    let _guard = progress_lock().lock().unwrap_or_else(|e| e.into_inner());
    let Some(file_path) = path else {
        return;
    };

    let mut prog: BTreeMap<String, Value> = if file_path.is_file() {
        fs::read_to_string(file_path)
            .ok()
            .and_then(|s| serde_json::from_str::<BTreeMap<String, Value>>(&s).ok())
            .unwrap_or_default()
    } else {
        BTreeMap::new()
    };

    let mut passed_list: Vec<String> = match prog.get("_ojPassed") {
        Some(Value::Array(arr)) => arr
            .iter()
            .filter_map(|v| v.as_str().map(str::to_string))
            .collect(),
        _ => Vec::new(),
    };

    if !passed_list.iter().any(|x| x == pid) {
        passed_list.push(pid.to_string());
    }

    prog.insert(
        "_ojPassed".to_string(),
        Value::Array(passed_list.into_iter().map(Value::String).collect()),
    );

    write_progress_map_atomic(file_path, &prog);
}

fn normalize_lab_id(raw: &Value) -> Option<String> {
    let raw_str = match raw {
        Value::String(s) => s.trim().to_string(),
        Value::Number(n) => n.to_string(),
        _ => return None,
    };
    if raw_str.is_empty() {
        return None;
    }
    let normalized = if raw_str.chars().all(|c| c.is_ascii_digit()) {
        if raw_str.len() == 1 {
            format!("0{raw_str}")
        } else {
            raw_str
        }
    } else {
        raw_str
    };
    if LAB_FOLDERS.iter().any(|(id, _)| *id == normalized) {
        Some(normalized)
    } else {
        None
    }
}

fn lab_folder_name(lab_id: &str) -> Option<&'static str> {
    LAB_FOLDERS
        .iter()
        .find(|(id, _)| *id == lab_id)
        .map(|(_, folder)| *folder)
}

fn save_lab_code_to_disk(lab_id: &str, code: &str) -> (bool, String) {
    let Some(folder) = lab_folder_name(lab_id) else {
        return (false, format!("无效的关卡编号: {lab_id}"));
    };
    let Some(labs_dir) = find_local_labs_dir() else {
        return (
            false,
            "当前为独立运行模式，未检测到本地 labs/ 目录，代码已保留在编辑器中。".to_string(),
        );
    };

    let target_dir = labs_dir.join(folder);
    let target_file = target_dir.join(format!("lab{lab_id}_todo.cpp"));
    if !target_dir.is_dir() {
        return (false, format!("找不到实验目录: {}", target_dir.display()));
    }

    if target_file.is_file() {
        let orig_bak = PathBuf::from(format!("{}.orig", target_file.display()));
        if !orig_bak.exists() {
            if let Err(e) = fs::copy(&target_file, &orig_bak) {
                return (false, e.to_string());
            }
        }
        let bak_file = PathBuf::from(format!("{}.bak", target_file.display()));
        if let Err(e) = fs::copy(&target_file, &bak_file) {
            return (false, e.to_string());
        }
    }

    let tmp_file = PathBuf::from(format!("{}.tmp", target_file.display()));
    if let Err(e) = fs::write(&tmp_file, code.as_bytes()) {
        return (false, e.to_string());
    }
    if fs::rename(&tmp_file, &target_file).is_err() {
        if let Err(e) = fs::copy(&tmp_file, &target_file) {
            let _ = fs::remove_file(&tmp_file);
            return (false, e.to_string());
        }
        let _ = fs::remove_file(&tmp_file);
    }

    (true, target_file.display().to_string())
}

fn clean_compiler_paths(text: &str, temp_src: &Path, display_name: &str) -> String {
    if text.is_empty() {
        return String::new();
    }
    let src_native = temp_src.to_string_lossy().into_owned();
    let src_slash = src_native.replace('\\', "/");
    text.replace(&src_native, display_name)
        .replace(&src_slash, display_name)
        .trim()
        .to_string()
}

pub fn normalize_oj_output(text: &str) -> String {
    let normalized_nl = text.replace("\r\n", "\n").replace('\r', "\n");
    let lines: Vec<&str> = normalized_nl
        .split('\n')
        .map(|ln| ln.trim_end())
        .collect();
    lines.join("\n").trim().to_string()
}

fn parse_summary_counts(stdout_text: &str) -> Option<(usize, usize)> {
    for line in stdout_text.lines() {
        if let Some(pos) = line.find("总计:") {
            let after = &line[pos + "总计:".len()..];
            let slash_pos = after.find('/')?;
            let left = after[..slash_pos].trim();
            let rest = after[slash_pos + 1..].trim();
            let pass_pos = rest.find("通过")?;
            let right = rest[..pass_pos].trim();
            let passed = left.parse::<usize>().ok()?;
            let total = right.parse::<usize>().ok()?;
            return Some((passed, total));
        }
    }
    None
}

pub fn parse_judge_output(stdout_text: &str) -> (usize, usize, Vec<JudgeCase>) {
    let mut cases: Vec<JudgeCase> = Vec::new();
    let mut current_fail_idx: Option<usize> = None;

    for raw_line in stdout_text.lines() {
        let line = raw_line.trim_end_matches('\r');
        let stripped = line.trim();

        if let Some(name) = line.strip_prefix("[PASS] ") {
            current_fail_idx = None;
            cases.push(JudgeCase {
                status: "pass".to_string(),
                name: name.trim().to_string(),
                expected: String::new(),
                actual: String::new(),
                hint: String::new(),
            });
        } else if let Some(name) = line.strip_prefix("[FAIL] ") {
            cases.push(JudgeCase {
                status: "fail".to_string(),
                name: name.trim().to_string(),
                expected: String::new(),
                actual: String::new(),
                hint: String::new(),
            });
            current_fail_idx = Some(cases.len() - 1);
        } else if let Some(idx) = current_fail_idx {
            if let Some(val) = stripped.strip_prefix("期望:") {
                cases[idx].expected = val.trim().to_string();
            } else if let Some(val) = stripped.strip_prefix("实际:") {
                cases[idx].actual = val.trim().to_string();
            } else if let Some(val) = stripped.strip_prefix("排查提示:") {
                cases[idx].hint = val.trim().to_string();
            } else if stripped.starts_with("----") || stripped.starts_with("总计:") {
                current_fail_idx = None;
            }
        }
    }

    if let Some((passed, total)) = parse_summary_counts(stdout_text) {
        (passed, total, cases)
    } else {
        let passed = cases.iter().filter(|c| c.status == "pass").count();
        let total = cases.len();
        (passed, total, cases)
    }
}

fn judge_lab_internal(
    progress_path: Option<&Path>,
    lab_id: &str,
    code: &str,
    save_to_disk: bool,
) -> JudgeResult {
    let mut saved_ok = false;
    let mut save_error = String::new();
    if save_to_disk {
        let (ok, info) = save_lab_code_to_disk(lab_id, code);
        saved_ok = ok;
        if !ok {
            save_error = info;
        }
    }

    let display_name = format!("lab{lab_id}_todo.cpp");
    let gpp = detect_gpp_info();
    if !gpp.found {
        update_progress_at_path(progress_path, lab_id, "compile_error", 0, 0);
        return JudgeResult {
            ok: false,
            compile_ok: false,
            compile_error: "未找到 g++ 编译器！请先安装 Dev-C++ 或 MSYS2/MinGW 并将 g++ 加入系统 PATH。".to_string(),
            warnings: String::new(),
            timed_out: false,
            crashed: false,
            exit_code: -1,
            passed: 0,
            total: 0,
            cases: Vec::new(),
            raw_output: String::new(),
            saved_to_disk: saved_ok,
            save_error,
        };
    }

    let tmp_guard = match TempDirGuard::new(&format!("ds_lab{lab_id}")) {
        Ok(g) => g,
        Err(e) => {
            return JudgeResult {
                ok: false,
                compile_ok: false,
                compile_error: format!("创建临时编译目录失败: {e}"),
                warnings: String::new(),
                timed_out: false,
                crashed: false,
                exit_code: -1,
                passed: 0,
                total: 0,
                cases: Vec::new(),
                raw_output: String::new(),
                saved_to_disk: saved_ok,
                save_error,
            };
        }
    };

    let tmp_common = tmp_guard.path().join("common");
    let tmp_lab = tmp_guard.path().join("lab");
    if let Err(e) = fs::create_dir_all(&tmp_common).and_then(|_| fs::create_dir_all(&tmp_lab)) {
        return JudgeResult {
            ok: false,
            compile_ok: false,
            compile_error: format!("初始化临时目录失败: {e}"),
            warnings: String::new(),
            timed_out: false,
            crashed: false,
            exit_code: -1,
            passed: 0,
            total: 0,
            cases: Vec::new(),
            raw_output: String::new(),
            saved_to_disk: saved_ok,
            save_error,
        };
    }

    let header_path = tmp_common.join("test_kit.h");
    let src_path = tmp_lab.join(format!("lab{lab_id}.cpp"));
    let exe_name = if cfg!(windows) {
        format!("lab{lab_id}.exe")
    } else {
        format!("lab{lab_id}")
    };
    let exe_path = tmp_lab.join(exe_name);

    if let Err(e) = fs::write(&header_path, TEST_KIT_HEADER.as_bytes())
        .and_then(|_| fs::write(&src_path, code.as_bytes()))
    {
        return JudgeResult {
            ok: false,
            compile_ok: false,
            compile_error: format!("写入临时源码失败: {e}"),
            warnings: String::new(),
            timed_out: false,
            crashed: false,
            exit_code: -1,
            passed: 0,
            total: 0,
            cases: Vec::new(),
            raw_output: String::new(),
            saved_to_disk: saved_ok,
            save_error,
        };
    }

    let mut comp_cmd = Command::new(&gpp.command);
    comp_cmd
        .arg("-std=c++11")
        .arg("-Wall")
        .arg("-Wextra")
        .arg(format!("-I{}", tmp_common.display()))
        .arg(&src_path)
        .arg("-o")
        .arg(&exe_path);
    prepend_bin_dir_to_path(&mut comp_cmd, gpp.bin_dir.as_deref());

    let comp_out = match run_command_with_timeout(
        &mut comp_cmd,
        Duration::from_secs(COMPILE_TIMEOUT_SECS),
        None,
    ) {
        Ok(o) => o,
        Err(e) => {
            update_progress_at_path(progress_path, lab_id, "compile_error", 0, 0);
            return JudgeResult {
                ok: false,
                compile_ok: false,
                compile_error: format!("调用 g++ 编译失败: {e}"),
                warnings: String::new(),
                timed_out: false,
                crashed: false,
                exit_code: -1,
                passed: 0,
                total: 0,
                cases: Vec::new(),
                raw_output: String::new(),
                saved_to_disk: saved_ok,
                save_error,
            };
        }
    };

    if comp_out.timed_out {
        update_progress_at_path(progress_path, lab_id, "compile_error", 0, 0);
        return JudgeResult {
            ok: false,
            compile_ok: false,
            compile_error: format!("编译超时（>{COMPILE_TIMEOUT_SECS}s）。"),
            warnings: String::new(),
            timed_out: false,
            crashed: false,
            exit_code: -1,
            passed: 0,
            total: 0,
            cases: Vec::new(),
            raw_output: String::new(),
            saved_to_disk: saved_ok,
            save_error,
        };
    }

    let comp_err_clean = clean_compiler_paths(&comp_out.stderr, &src_path, &display_name);
    if comp_out.exit_code != 0 {
        update_progress_at_path(progress_path, lab_id, "compile_error", 0, 0);
        return JudgeResult {
            ok: false,
            compile_ok: false,
            compile_error: if comp_err_clean.is_empty() {
                "编译失败（未知错误）".to_string()
            } else {
                comp_err_clean
            },
            warnings: String::new(),
            timed_out: false,
            crashed: false,
            exit_code: comp_out.exit_code,
            passed: 0,
            total: 0,
            cases: Vec::new(),
            raw_output: String::new(),
            saved_to_disk: saved_ok,
            save_error,
        };
    }

    let warnings = comp_err_clean;

    let mut run_cmd = Command::new(&exe_path);
    prepend_bin_dir_to_path(&mut run_cmd, gpp.bin_dir.as_deref());

    let run_out = match run_command_with_timeout(
        &mut run_cmd,
        Duration::from_secs(RUN_TIMEOUT_SECS),
        None,
    ) {
        Ok(o) => o,
        Err(e) => {
            update_progress_at_path(progress_path, lab_id, "in_progress", 0, 0);
            return JudgeResult {
                ok: false,
                compile_ok: true,
                compile_error: String::new(),
                warnings,
                timed_out: false,
                crashed: true,
                exit_code: -1,
                passed: 0,
                total: 0,
                cases: Vec::new(),
                raw_output: format!("启动评测程序失败: {e}"),
                saved_to_disk: saved_ok,
                save_error,
            };
        }
    };

    if run_out.timed_out {
        update_progress_at_path(progress_path, lab_id, "timeout", 0, 0);
        return JudgeResult {
            ok: false,
            compile_ok: true,
            compile_error: String::new(),
            warnings,
            timed_out: true,
            crashed: false,
            exit_code: -1,
            passed: 0,
            total: 0,
            cases: Vec::new(),
            raw_output: run_out.stdout,
            saved_to_disk: saved_ok,
            save_error,
        };
    }

    let raw_output = if run_out.stderr.trim().is_empty() {
        run_out.stdout.clone()
    } else {
        format!(
            "{}\n[stderr]\n{}",
            run_out.stdout.trim_end(),
            run_out.stderr.trim()
        )
        .trim()
        .to_string()
    };

    let (passed, total, cases) = parse_judge_output(&run_out.stdout);
    let crashed = run_out.exit_code < 0 || run_out.exit_code > 1;
    let all_passed = run_out.exit_code == 0 && !crashed && total > 0 && passed == total;

    if all_passed {
        update_progress_at_path(progress_path, lab_id, "passed", passed, total);
    } else {
        update_progress_at_path(progress_path, lab_id, "in_progress", passed, total);
    }

    JudgeResult {
        ok: all_passed,
        compile_ok: true,
        compile_error: String::new(),
        warnings,
        timed_out: false,
        crashed,
        exit_code: run_out.exit_code,
        passed,
        total,
        cases,
        raw_output,
        saved_to_disk: saved_ok,
        save_error,
    }
}

fn judge_oj_internal(
    progress_path: Option<&Path>,
    problem_id: &str,
    code: &str,
    test_cases: &[OjTestCase],
) -> OjJudgeResult {
    let total = test_cases.len();
    let gpp = detect_gpp_info();
    if !gpp.found {
        return OjJudgeResult {
            ok: false,
            compile_ok: false,
            verdict: "CE".to_string(),
            compile_error: "未找到 g++ 编译器！请先安装 Dev-C++ 或 MSYS2/MinGW 并将 g++ 加入系统 PATH。".to_string(),
            warnings: String::new(),
            passed: 0,
            total,
            cases: Vec::new(),
        };
    }

    let tmp_guard = match TempDirGuard::new("ds_oj") {
        Ok(g) => g,
        Err(e) => {
            return OjJudgeResult {
                ok: false,
                compile_ok: false,
                verdict: "CE".to_string(),
                compile_error: format!("创建临时编译目录失败: {e}"),
                warnings: String::new(),
                passed: 0,
                total,
                cases: Vec::new(),
            };
        }
    };

    let src_path = tmp_guard.path().join("main.cpp");
    let exe_name = if cfg!(windows) { "main.exe" } else { "main" };
    let exe_path = tmp_guard.path().join(exe_name);

    if let Err(e) = fs::write(&src_path, code.as_bytes()) {
        return OjJudgeResult {
            ok: false,
            compile_ok: false,
            verdict: "CE".to_string(),
            compile_error: format!("写入临时源码失败: {e}"),
            warnings: String::new(),
            passed: 0,
            total,
            cases: Vec::new(),
        };
    }

    let mut comp_cmd = Command::new(&gpp.command);
    comp_cmd
        .arg("-std=c++11")
        .arg("-O2")
        .arg("-Wall")
        .arg("-Wextra")
        .arg(&src_path)
        .arg("-o")
        .arg(&exe_path);
    prepend_bin_dir_to_path(&mut comp_cmd, gpp.bin_dir.as_deref());

    let comp_out = match run_command_with_timeout(
        &mut comp_cmd,
        Duration::from_secs(COMPILE_TIMEOUT_SECS),
        None,
    ) {
        Ok(o) => o,
        Err(e) => {
            return OjJudgeResult {
                ok: false,
                compile_ok: false,
                verdict: "CE".to_string(),
                compile_error: format!("调用 g++ 编译失败: {e}"),
                warnings: String::new(),
                passed: 0,
                total,
                cases: Vec::new(),
            };
        }
    };

    if comp_out.timed_out {
        return OjJudgeResult {
            ok: false,
            compile_ok: false,
            verdict: "CE".to_string(),
            compile_error: format!("编译超时（>{COMPILE_TIMEOUT_SECS}s）。"),
            warnings: String::new(),
            passed: 0,
            total,
            cases: Vec::new(),
        };
    }

    let comp_err_clean = clean_compiler_paths(&comp_out.stderr, &src_path, "main.cpp");
    if comp_out.exit_code != 0 {
        return OjJudgeResult {
            ok: false,
            compile_ok: false,
            verdict: "CE".to_string(),
            compile_error: if comp_err_clean.is_empty() {
                "编译失败（未知错误）".to_string()
            } else {
                comp_err_clean
            },
            warnings: String::new(),
            passed: 0,
            total,
            cases: Vec::new(),
        };
    }

    let warnings = comp_err_clean;
    let mut results = Vec::with_capacity(total);
    let mut passed = 0usize;
    let mut first_fail_verdict: Option<String> = None;

    for (idx, tc) in test_cases.iter().enumerate() {
        let label = if tc.label.trim().is_empty() {
            format!("测试点 #{}", idx + 1)
        } else {
            tc.label.clone()
        };

        let mut run_cmd = Command::new(&exe_path);
        prepend_bin_dir_to_path(&mut run_cmd, gpp.bin_dir.as_deref());

        let run_res = run_command_with_timeout(
            &mut run_cmd,
            Duration::from_secs(OJ_CASE_TIMEOUT_SECS),
            Some(&tc.input),
        );

        let case_result = match run_res {
            Err(e) => {
                if first_fail_verdict.is_none() {
                    first_fail_verdict = Some("RE".to_string());
                }
                OjCaseResult {
                    index: idx + 1,
                    label,
                    status: "RE".to_string(),
                    input: tc.input.clone(),
                    expected: tc.expected.clone(),
                    actual: String::new(),
                    time_ms: 0,
                    error: format!("启动程序失败: {e}"),
                }
            }
            Ok(out) => {
                if out.timed_out {
                    if first_fail_verdict.is_none() {
                        first_fail_verdict = Some("TLE".to_string());
                    }
                    OjCaseResult {
                        index: idx + 1,
                        label,
                        status: "TLE".to_string(),
                        input: tc.input.clone(),
                        expected: tc.expected.clone(),
                        actual: out.stdout,
                        time_ms: out.elapsed_ms,
                        error: format!("运行超时（>{OJ_CASE_TIMEOUT_SECS}.0s），请检查是否存在死循环或时间复杂度过高"),
                    }
                } else if out.exit_code != 0 {
                    if first_fail_verdict.is_none() {
                        first_fail_verdict = Some("RE".to_string());
                    }
                    let err_msg = if out.stderr.trim().is_empty() {
                        format!("运行时错误（退出码 {}）", out.exit_code)
                    } else {
                        format!("退出码 {}：{}", out.exit_code, out.stderr.trim())
                    };
                    OjCaseResult {
                        index: idx + 1,
                        label,
                        status: "RE".to_string(),
                        input: tc.input.clone(),
                        expected: tc.expected.clone(),
                        actual: out.stdout,
                        time_ms: out.elapsed_ms,
                        error: err_msg,
                    }
                } else {
                    let norm_actual = normalize_oj_output(&out.stdout);
                    let norm_expected = normalize_oj_output(&tc.expected);
                    if norm_actual == norm_expected {
                        passed += 1;
                        OjCaseResult {
                            index: idx + 1,
                            label,
                            status: "AC".to_string(),
                            input: tc.input.clone(),
                            expected: tc.expected.clone(),
                            actual: out.stdout.trim_end().to_string(),
                            time_ms: out.elapsed_ms,
                            error: String::new(),
                        }
                    } else {
                        if first_fail_verdict.is_none() {
                            first_fail_verdict = Some("WA".to_string());
                        }
                        OjCaseResult {
                            index: idx + 1,
                            label,
                            status: "WA".to_string(),
                            input: tc.input.clone(),
                            expected: tc.expected.clone(),
                            actual: out.stdout.trim_end().to_string(),
                            time_ms: out.elapsed_ms,
                            error: if out.stderr.trim().is_empty() {
                                String::new()
                            } else {
                                out.stderr.trim().to_string()
                            },
                        }
                    }
                }
            }
        };

        results.push(case_result);
    }

    let all_ac = total > 0 && passed == total;
    let verdict = if all_ac {
        "AC".to_string()
    } else {
        first_fail_verdict.unwrap_or_else(|| "WA".to_string())
    };

    if all_ac {
        record_oj_passed_at_path(progress_path, problem_id);
    }

    OjJudgeResult {
        ok: all_ac,
        compile_ok: true,
        verdict,
        compile_error: String::new(),
        warnings,
        passed,
        total,
        cases: results,
    }
}

fn run_demo_internal(code: &str, stdin_data: Option<&str>) -> DemoResult {
    let gpp = detect_gpp_info();
    if !gpp.found {
        return DemoResult {
            compile_ok: false,
            compile_error: "未找到 g++ 编译器！请先安装 Dev-C++ 或 MSYS2/MinGW 并将 g++ 加入系统 PATH。".to_string(),
            timed_out: false,
            exit_code: -1,
            stdout: String::new(),
            stderr: String::new(),
        };
    }

    let tmp_guard = match TempDirGuard::new("ds_demo") {
        Ok(g) => g,
        Err(e) => {
            return DemoResult {
                compile_ok: false,
                compile_error: format!("创建临时编译目录失败: {e}"),
                timed_out: false,
                exit_code: -1,
                stdout: String::new(),
                stderr: String::new(),
            };
        }
    };

    let src_path = tmp_guard.path().join("demo.cpp");
    let exe_name = if cfg!(windows) { "demo.exe" } else { "demo" };
    let exe_path = tmp_guard.path().join(exe_name);

    if let Err(e) = fs::write(&src_path, code.as_bytes()) {
        return DemoResult {
            compile_ok: false,
            compile_error: format!("写入临时源码失败: {e}"),
            timed_out: false,
            exit_code: -1,
            stdout: String::new(),
            stderr: String::new(),
        };
    }

    let mut comp_cmd = Command::new(&gpp.command);
    comp_cmd
        .arg("-std=c++11")
        .arg(&src_path)
        .arg("-o")
        .arg(&exe_path);
    prepend_bin_dir_to_path(&mut comp_cmd, gpp.bin_dir.as_deref());

    let comp_out = match run_command_with_timeout(
        &mut comp_cmd,
        Duration::from_secs(COMPILE_TIMEOUT_SECS),
        None,
    ) {
        Ok(o) => o,
        Err(e) => {
            return DemoResult {
                compile_ok: false,
                compile_error: format!("调用 g++ 编译失败: {e}"),
                timed_out: false,
                exit_code: -1,
                stdout: String::new(),
                stderr: String::new(),
            };
        }
    };

    if comp_out.timed_out {
        return DemoResult {
            compile_ok: false,
            compile_error: format!("编译超时（>{COMPILE_TIMEOUT_SECS}s）。"),
            timed_out: false,
            exit_code: -1,
            stdout: String::new(),
            stderr: String::new(),
        };
    }

    if comp_out.exit_code != 0 {
        let err = clean_compiler_paths(&comp_out.stderr, &src_path, "demo.cpp");
        return DemoResult {
            compile_ok: false,
            compile_error: if err.is_empty() {
                "编译失败".to_string()
            } else {
                err
            },
            timed_out: false,
            exit_code: comp_out.exit_code,
            stdout: String::new(),
            stderr: String::new(),
        };
    }

    let mut run_cmd = Command::new(&exe_path);
    prepend_bin_dir_to_path(&mut run_cmd, gpp.bin_dir.as_deref());

    let run_out = match run_command_with_timeout(
        &mut run_cmd,
        Duration::from_secs(RUN_TIMEOUT_SECS),
        stdin_data,
    ) {
        Ok(o) => o,
        Err(e) => {
            return DemoResult {
                compile_ok: true,
                compile_error: String::new(),
                timed_out: false,
                exit_code: -1,
                stdout: String::new(),
                stderr: format!("启动演示程序失败: {e}"),
            };
        }
    };

    if run_out.timed_out {
        return DemoResult {
            compile_ok: true,
            compile_error: String::new(),
            timed_out: true,
            exit_code: -1,
            stdout: run_out.stdout,
            stderr: run_out.stderr,
        };
    }

    DemoResult {
        compile_ok: true,
        compile_error: String::new(),
        timed_out: false,
        exit_code: run_out.exit_code,
        stdout: run_out.stdout,
        stderr: run_out.stderr,
    }
}

#[tauri::command]
async fn check_health() -> Result<HealthResponse, String> {
    tauri::async_runtime::spawn_blocking(|| {
        let gpp = detect_gpp_info();
        HealthResponse {
            ok: true,
            mode: "tauri".to_string(),
            gpp: gpp.found,
            gpp_version: gpp.version,
            labs_count: LAB_FOLDERS.len(),
            can_shutdown: false,
        }
    })
    .await
    .map_err(|e| format!("健康检查任务执行失败: {e}"))
}

#[tauri::command]
fn get_progress(app: tauri::AppHandle) -> Value {
    let path = resolve_progress_path(Some(&app));
    load_progress_from_path(path.as_deref())
}

#[tauri::command]
async fn judge_lab(
    app: tauri::AppHandle,
    lab_id: Value,
    code: String,
    save_to_disk: Option<bool>,
) -> Result<JudgeResult, String> {
    let normalized = normalize_lab_id(&lab_id)
        .ok_or_else(|| format!("无效的关卡编号: {lab_id}"))?;
    let progress_path = resolve_progress_path(Some(&app));
    let should_save = save_to_disk.unwrap_or(false);

    tauri::async_runtime::spawn_blocking(move || {
        judge_lab_internal(progress_path.as_deref(), &normalized, &code, should_save)
    })
    .await
    .map_err(|e| format!("评测任务执行失败: {e}"))
}

#[tauri::command]
async fn judge_oj(
    app: tauri::AppHandle,
    problem_id: String,
    code: String,
    test_cases: Vec<OjTestCase>,
) -> Result<OjJudgeResult, String> {
    let progress_path = resolve_progress_path(Some(&app));
    tauri::async_runtime::spawn_blocking(move || {
        judge_oj_internal(progress_path.as_deref(), &problem_id, &code, &test_cases)
    })
    .await
    .map_err(|e| format!("OJ 评测任务执行失败: {e}"))
}

#[tauri::command]
async fn run_demo(code: String, stdin: Option<String>) -> Result<DemoResult, String> {
    tauri::async_runtime::spawn_blocking(move || run_demo_internal(&code, stdin.as_deref()))
        .await
        .map_err(|e| format!("运行示例任务执行失败: {e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            check_health,
            get_progress,
            judge_lab,
            judge_oj,
            run_demo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_judge_output_pass_and_fail() {
        let sample = r#"================================================
  Lab 02: 顺序表手写测试
================================================
[PASS] 空表初始化 length == 0
[FAIL] 尾插 3 个元素后遍历一致
       期望: [10, 20, 30]
       实际: [10, 20]
       排查提示: 检查 length++ 是否漏写
[PASS] 越界删除返回 false
------------------------------------------------
总计: 2 / 3 通过  (还有 1 项未通过，请按提示排查)
"#;
        let (passed, total, cases) = parse_judge_output(sample);
        assert_eq!(passed, 2);
        assert_eq!(total, 3);
        assert_eq!(cases.len(), 3);

        assert_eq!(cases[0].status, "pass");
        assert_eq!(cases[0].name, "空表初始化 length == 0");

        assert_eq!(cases[1].status, "fail");
        assert_eq!(cases[1].name, "尾插 3 个元素后遍历一致");
        assert_eq!(cases[1].expected, "[10, 20, 30]");
        assert_eq!(cases[1].actual, "[10, 20]");
        assert_eq!(cases[1].hint, "检查 length++ 是否漏写");

        assert_eq!(cases[2].status, "pass");
        assert_eq!(cases[2].name, "越界删除返回 false");
    }

    #[test]
    fn test_normalize_lab_id() {
        assert_eq!(normalize_lab_id(&Value::String("0".into())), Some("00".into()));
        assert_eq!(normalize_lab_id(&Value::String("07".into())), Some("07".into()));
        assert_eq!(normalize_lab_id(&Value::from(14)), Some("14".into()));
        assert_eq!(normalize_lab_id(&Value::String("99".into())), None);
    }

    #[test]
    fn test_real_gpp_judge_with_embedded_test_kit() {
        let gpp = detect_gpp_info();
        assert!(gpp.found, "测试环境应当检测到 g++ 编译器");

        let cpp_code = r#"
#include "../common/test_kit.h"
#include <vector>

int add(int a, int b) { return a + b; }

int main() {
    labtest::beginLab("Rust 内嵌 test_kit.h 真编译验证");
    labtest::expectEqInt("1 + 2 == 3", 3, add(1, 2));
    labtest::expectEqVec("向量一致", {1, 2, 3}, std::vector<int>{1, 2, 3});
    labtest::expectTrue("布尔条件为真", true);
    return labtest::endLab();
}
"#;
        let result = judge_lab_internal(None, "00", cpp_code, false);
        assert!(result.compile_ok, "编译失败: {}", result.compile_error);
        assert!(result.ok, "评测应全部通过，原始输出:\n{}", result.raw_output);
        assert_eq!(result.passed, 3);
        assert_eq!(result.total, 3);
        assert_eq!(result.cases.len(), 3);
        assert!(!result.timed_out);
        assert!(!result.crashed);
    }

    #[test]
    fn test_real_gpp_run_demo() {
        let gpp = detect_gpp_info();
        assert!(gpp.found, "测试环境应当检测到 g++ 编译器");

        let demo_code = r#"
#include <iostream>
int main() {
    std::cout << "Hello Tauri DSA!" << std::endl;
    return 0;
}
"#;
        let res = run_demo_internal(demo_code, None);
        assert!(res.compile_ok, "演示代码编译失败: {}", res.compile_error);
        assert!(!res.timed_out);
        assert_eq!(res.exit_code, 0);
        assert_eq!(res.stdout.trim(), "Hello Tauri DSA!");
    }

    #[test]
    fn test_real_gpp_judge_oj_ac_and_wa() {
        let gpp = detect_gpp_info();
        assert!(gpp.found, "测试环境应当检测到 g++ 编译器");

        let tmp_prog_dir = TempDirGuard::new("ds_oj_prog_test").expect("创建临时进度目录");
        let prog_file = tmp_prog_dir.path().join("progress.json");

        let ac_code = r#"
#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a + b) << "  \n";
    }
    return 0;
}
"#;
        let cases = vec![
            OjTestCase {
                label: "样例 1".into(),
                input: "3 5\n".into(),
                expected: "8".into(),
            },
            OjTestCase {
                label: "负数边界".into(),
                input: "-10 25\n".into(),
                expected: "15\n".into(),
            },
        ];

        let ac_res = judge_oj_internal(Some(&prog_file), "oj01", ac_code, &cases);
        assert!(ac_res.compile_ok, "编译失败: {}", ac_res.compile_error);
        assert!(ac_res.ok, "应为 AC，实际: {:?}", ac_res);
        assert_eq!(ac_res.verdict, "AC");
        assert_eq!(ac_res.passed, 2);
        assert_eq!(ac_res.total, 2);
        assert_eq!(ac_res.cases[0].status, "AC");
        assert_eq!(ac_res.cases[1].status, "AC");

        // 验证 _ojPassed 持久化写入
        let loaded = load_progress_from_path(Some(&prog_file));
        let oj_arr = loaded
            .get("_ojPassed")
            .and_then(|v| v.as_array())
            .expect("应包含 _ojPassed 数组");
        assert!(oj_arr.iter().any(|v| v.as_str() == Some("oj01")));

        // 测试 WA 场景
        let wa_code = r#"
#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a - b) << "\n";
    }
    return 0;
}
"#;
        let wa_res = judge_oj_internal(Some(&prog_file), "oj02", wa_code, &cases);
        assert!(wa_res.compile_ok);
        assert!(!wa_res.ok);
        assert_eq!(wa_res.verdict, "WA");
        assert_eq!(wa_res.passed, 0);
        assert_eq!(wa_res.total, 2);
        assert_eq!(wa_res.cases[0].status, "WA");
        assert_eq!(wa_res.cases[0].actual, "-2");
    }

    #[test]
    fn test_real_gpp_run_demo_with_stdin() {
        let gpp = detect_gpp_info();
        assert!(gpp.found, "测试环境应当检测到 g++ 编译器");

        let code = r#"
#include <iostream>
#include <string>
using namespace std;
int main() {
    int n;
    string name;
    cin >> n >> name;
    cout << name << ":" << (n * 2) << "\n";
    return 0;
}
"#;
        let res = run_demo_internal(code, Some("21 TauriOJ\n"));
        assert!(res.compile_ok, "编译失败: {}", res.compile_error);
        assert!(!res.timed_out);
        assert_eq!(res.exit_code, 0);
        assert_eq!(res.stdout.trim(), "TauriOJ:42");
    }
}
