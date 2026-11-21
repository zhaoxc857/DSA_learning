// ============================================================================
// 关卡 06：KMP 串模式匹配 + 迷宫回溯 + 0-1 背包动态规划（学生练习版）
// 对应教材：第 3 章 3.4 串模式匹配 / KMP + 3.6 四大经典算法思想
//
// 本关目标：
//   1. 手写暴力匹配 bfMatch，避免无符号减法下溢陷阱
//   2. 真正搞懂并手写 KMP 的 next（前缀函数 / LPS）数组 buildNext
//   3. 利用 next 数组手写 O(n + m) 的 kmpMatch
//   4. 用递归回溯（DFS）求解迷宫连通性 solveMaze
//   5. 用动态规划手写 0-1 背包 knapsack01（理解一维数组为何必须倒序）
//
// 运行评测（在 labs 目录下）：
//   python judge.py 06
// ============================================================================

#include "../common/test_kit.h"
#include <algorithm>
#include <string>
#include <vector>

// ----------------------------------------------------------------------------
// 任务 1：暴力模式匹配（Brute-Force）
// 【函数目标】
//   在主串 text 中查找模式串 pat 首次出现的起始下标（0-based）。
//   - 若找到，返回首次匹配的起始下标（0 ~ text.size() - pat.size()）
//   - 若找不到，返回 -1
//   - 约定：空模式串（pat.empty()）返回 0
// 【画图与思路推导】
//   1. 先把 text.size() 和 pat.size() 转成 int（记为 n、m）：
//      若 m == 0 返回 0；若 m > n 直接返回 -1。
//   2. 外层循环枚举起始位置 i = 0 .. n - m：
//        内层循环 j = 0 .. m - 1：
//          若 text[i + j] != pat[j]，立刻 break；
//        若内层正常走完（j == m），说明从 i 开始完全匹配，返回 i。
//   3. 外层结束仍未找到，返回 -1。
// 【边界提醒】
//   - 千万不要写 for (size_t i = 0; i <= text.size() - pat.size(); ++i)！
//     当 pat 比 text 长时，无符号 size_t 相减会下溢成一个极大正数，导致越界崩溃！
// ----------------------------------------------------------------------------
int bfMatch(const std::string& text, const std::string& pat) {
    // TODO: 实现暴力串模式匹配
    (void)text;
    (void)pat;
    return -1;
}

// ----------------------------------------------------------------------------
// 任务 2：构造 KMP 前缀函数 / next 数组（0-based LPS 定义）
// 【函数目标】
//   计算模式串 pat 的 next 数组（长度与 pat 相同）：
//   next[i] 表示子串 pat[0..i] 的「最长相等真前缀与真后缀」的长度。
//   （“真”指不能等于 pat[0..i] 本身，因此 next[0] 恒为 0）
//   例如 pat = "abcac"：
//     i=0 "a"     -> 0
//     i=1 "ab"    -> 0
//     i=2 "abc"   -> 0
//     i=3 "abca"  -> 1（"a" == "a"）
//     i=4 "abcac" -> 0
//   故返回 {0, 0, 0, 1, 0}。若 pat 为空，返回空 vector {}。
// 【画图与思路推导】（务必看懂为什么失配时是 j = next[j - 1]！）
//   1. 若 pat.empty()，返回 {}。创建 vector<int> next(m, 0)，设 j = 0。
//      变量含义：
//        i：当前正在计算 next[i] 的后缀末尾下标（从 1 遍历到 m - 1）
//        j：前一步已匹配好的前缀长度，同时也是前缀下一个待比较字符下标 pat[j]
//   2. 此时已知前一段相等：pat[0 .. j-1] == pat[i-j .. i-1]。
//      现在尝试把新字符 pat[i] 接上去，看 pat[i] 是否等于 pat[j]：
//      - 若不等且 j > 0，为什么回退到 j = next[j - 1] 而不是退回 0？
//        画出两段相等区间就懂了：
//          [  前缀: pat[0 .. j-1]  ] == [  后缀: pat[i-j .. i-1]  ]
//        设 k = next[j - 1]，它代表左侧 pat[0 .. j-1] 内部最长的相等前后缀：
//          pat[0 .. k-1] == pat[j-k .. j-1]
//        又因为整段左侧等于右侧，所以右侧末尾 k 个字符必然和左侧末尾 k 个一样：
//          pat[0 .. k-1] == pat[j-k .. j-1] == pat[i-k .. i-1] ！
//        这说明长度 k 依然是 pat[0 .. i-1] 的合法相等前后缀，而且是仅次于 j 的
//        最长候选！所以我们令 j = next[j - 1]，继续比较 pat[j] 和 pat[i]。
//        因为可能连续多次不等，这里必须用 while：
//          while (j > 0 && pat[i] != pat[j]) {
//              j = next[j - 1];
//          }
//      - 跳出 while 后，如果 pat[i] == pat[j]，说明长度可加 1：j++；
//      - 记录 next[i] = j。
//   3. 返回 next。
// 【边界提醒】
//   - 空串 pat.empty() 直接返回 {}，避免访问 next[0] 越界。
//   - 回退必须用 while，不能只用一次 if（例如 "aabaaab" 会连续回退）。
// ----------------------------------------------------------------------------
std::vector<int> buildNext(const std::string& pat) {
    // TODO: 计算 0-based 前缀函数 next 数组
    (void)pat;
    return {};
}

// ----------------------------------------------------------------------------
// 任务 3：KMP 串模式匹配
// 【函数目标】
//   利用 buildNext(pat) 在主串 text 中查找模式串 pat 首次出现的起始下标（0-based）。
//   - 找不到返回 -1
//   - 空模式串返回 0
// 【画图与思路推导】
//   1. 处理边界：pat 为空返回 0；pat.size() > text.size() 返回 -1。
//   2. 调用 next = buildNext(pat)，初始化模式串匹配长度 j = 0。
//   3. 主串下标 i 从 0 扫到 n - 1（注意：i 只往前走，永不回退！）：
//        a) 若失配且 j > 0：while (j > 0 && text[i] != pat[j]) j = next[j - 1];
//        b) 若匹配成功：if (text[i] == pat[j]) j++;
//        c) 若 j == m：整条模式串匹配完成！
//           此刻末尾落在 i，长度为 m，起始下标就是 i - m + 1，立刻返回！
//   4. 扫描结束未匹配，返回 -1。
// 【边界提醒】
//   - 起始下标是 i - m + 1，不是 i - m（可代入 i=2, m=3 验算：0,1,2 -> 2-3+1=0）。
//   - text 为空且 pat 也为空时应返回 0。
// ----------------------------------------------------------------------------
int kmpMatch(const std::string& text, const std::string& pat) {
    // TODO: 调用 buildNext 并实现 KMP 匹配
    (void)text;
    (void)pat;
    return -1;
}

// ----------------------------------------------------------------------------
// 任务 4：回溯法迷宫求解
// 【函数目标】
//   给定二维迷宫 grid（0 表示通路，1 表示墙），起点 (sr, sc)，终点 (tr, tc)。
//   每次可向上、下、左、右四个方向走一步（不能走出边界，不能走墙）。
//   判断是否存在一条从起点到终点的通路：存在返回 true，否则返回 false。
// 【画图与思路推导】
//   建议在 solveMaze 上方写一个辅助递归函数 dfsMaze，或直接在内部调用辅助函数：
//   1. 边界预检：
//      - grid 为空或 grid[0] 为空 -> 返回 false；
//      - 起点 (sr, sc) 或终点 (tr, tc) 越界 -> 返回 false；
//      - grid[sr][sc] == 1 或 grid[tr][tc] == 1（起点或终点是墙）-> 返回 false。
//   2. 建访问数组 visited(rows, vector<int>(cols, 0))，防止在环路里反复兜圈子。
//   3. 递归函数 dfs(r, c)：
//      - 出口：若 r == tr && c == tc，已抵达终点，返回 true！
//      - 标记当前格子已访问：visited[r][c] = 1；
//      - 用方向数组 dr[4] = {-1, 1, 0, 0}, dc[4] = {0, 0, -1, 1} 试探四个邻居 (nr, nc)：
//          若 (nr, nc) 未越界 && grid[nr][nc] == 0 && !visited[nr][nc]：
//            若 dfs(nr, nc) 返回 true，立刻向上返回 true！
//      - 四个方向都走不通，回溯返回 false。
//   【小提示】
//     因为本题只需判断“能否到达”，某个格子四面八方都试过走不通后，以后从别处再
//     走到它同样走不通，所以不需要撤销 visited[r][c] = 0（撤销反而会导致指数级超时）。
//     若是“列出所有路径”才需要恢复现场！
// 【边界提醒】
//   - 起点 == 终点且该格子为 0 时应返回 true；若是 1（墙）必须返回 false。
//   - 忘记标记 visited 会在有环的迷宫里无限递归导致栈溢出！
// ----------------------------------------------------------------------------
bool solveMaze(const std::vector<std::vector<int>>& grid, int sr, int sc, int tr, int tc) {
    // TODO: 实现回溯法迷宫求解
    (void)grid;
    (void)sr;
    (void)sc;
    (void)tr;
    (void)tc;
    return false;
}

// ----------------------------------------------------------------------------
// 任务 5：0-1 背包问题（动态规划）
// 【函数目标】
//   有 n 件物品，第 i 件物品重量为 weight[i]、价值为 value[i]（均非负），
//   每件物品最多只能选 1 次（要么不选 0，要么选 1）。
//   背包最大承重为 W，返回能装入物品的最大总价值。
// 【画图与思路推导】
//   1. 边界：若 W <= 0 或 weight.empty()，返回 0。
//   2. 状态定义（滚动一维数组）：
//      vector<int> dp(W + 1, 0)，dp[c] 表示背包容量为 c 时的最大价值。
//   3. 状态转移：
//      外层遍历每件物品 i = 0 .. n - 1：
//        内层容量 c 从 W 倒序遍历到 weight[i]（c >= weight[i]）：
//          dp[c] = std::max(dp[c], dp[c - weight[i]] + value[i]);
//      【为什么内层容量必须倒序？】
//        如果不倒序（从小到大），算 dp[c] 时用到的 dp[c - weight[i]] 可能在本轮
//        刚被更新过（已经放过一次物品 i），结果物品 i 被反复装入多次，变成“完全背包”！
//        倒序时，dp[c - weight[i]] 还是上一轮（没放物品 i）的旧值，严格保证每件最多选 1 次。
//   4. 最终答案就是 dp[W]。
// 【边界提醒】
//   - W == 0 或物品为空返回 0。
//   - 某件物品 weight[i] > W 时，内层循环 c = W; c >= weight[i] 自然不执行，不会越界。
// ----------------------------------------------------------------------------
int knapsack01(const std::vector<int>& weight, const std::vector<int>& value, int W) {
    // TODO: 实现 0-1 背包动态规划
    (void)weight;
    (void)value;
    (void)W;
    return 0;
}

// ============================================================================
// 自动测试套件（请勿修改 main 函数，保持与评测系统一致）
// ============================================================================
int main() {
    labtest::beginLab("关卡 06：KMP 串匹配 + 迷宫回溯 + 0-1 背包 DP");

    // ---------- 1. BF 暴力匹配测试 ----------
    labtest::expectEqInt("BF 经典主串查找 abcac", 5,
        bfMatch("ababcabcacbab", "abcac"),
        "检查外层起始下标范围 0..n-m 与内层 text[i+j] == pat[j] 比较");
    labtest::expectEqInt("BF 重复字符 aaaaa 找 aaa", 0,
        bfMatch("aaaaa", "aaa"),
        "应返回首次匹配下标 0");
    labtest::expectEqInt("BF 末尾刚好匹配", 4,
        bfMatch("abcdef", "ef"),
        "检查外层循环边界是否是 i <= n - m（别漏了等号！）");
    labtest::expectEqInt("BF 失配返回 -1", -1,
        bfMatch("abcdef", "abd"),
        "找不到模式串时应返回 -1");
    labtest::expectEqInt("BF 空模式串返回 0", 0,
        bfMatch("hello", ""),
        "约定 pat.empty() 返回 0");
    labtest::expectEqInt("BF 模式串比主串长", -1,
        bfMatch("ab", "abcd"),
        "先转 int 判断 m > n 返回 -1，防止 size_t 无符号减法下溢！");

    // ---------- 2. KMP next 数组测试 ----------
    labtest::expectEqVec("next 数组: abcac", {0, 0, 0, 1, 0},
        buildNext("abcac"),
        "next[i] 是 pat[0..i] 最长相等真前后缀长度，next[0]=0，pat[0..3]=abca 的前后缀 a 长度为 1");
    labtest::expectEqVec("next 数组: ababa", {0, 0, 1, 2, 3},
        buildNext("ababa"),
        "每次 pat[i] == pat[j] 时 j++ 并写入 next[i]");
    labtest::expectEqVec("next 数组: aabaaf (需回退)", {0, 1, 0, 1, 2, 0},
        buildNext("aabaaf"),
        "在 i=2('b') 和 i=5('f') 处需通过 while (j > 0 && pat[i] != pat[j]) j = next[j-1] 回退");
    labtest::expectEqVec("next 数组: aabaaab (需连续多次回退)", {0, 1, 0, 1, 2, 2, 3},
        buildNext("aabaaab"),
        "检查回退是否用了 while 而不是 if：i=5('a') 时 j=2 失配需退到 next[1]=1，匹配 pat[1]='a' 后 j 变成 2");
    labtest::expectEqVec("next 数组: 空串", {},
        buildNext(""),
        "空串应直接返回空 vector {}，避免访问 next[0] 越界");

    // ---------- 3. KMP 模式匹配测试 ----------
    labtest::expectEqInt("KMP 经典重复前缀 ababcabcacbab 找 abcac", 5,
        kmpMatch("ababcabcacbab", "abcac"),
        "检查失配回退 j = next[j - 1] 与匹配成功返回 i - m + 1");
    labtest::expectEqInt("KMP 重复字符 aaaaa 找 aaa", 0,
        kmpMatch("aaaaa", "aaa"),
        "首次匹配位置应为 0");
    labtest::expectEqInt("KMP 连续回退主串查找", 4,
        kmpMatch("abacababc", "abab"),
        "检查失配时是否用 while 循环回退 j，且主串指针 i 不回退");
    labtest::expectEqInt("KMP 末尾刚好匹配", 5,
        kmpMatch("aabaabaaf", "baaf"),
        "起始下标应是 i - m + 1（8 - 4 + 1 = 5）");
    labtest::expectEqInt("KMP 失配返回 -1", -1,
        kmpMatch("ababcabcacbab", "abcad"),
        "找不到时应返回 -1");
    labtest::expectEqInt("KMP 空模式串返回 0", 0,
        kmpMatch("abc", ""),
        "约定空模式串返回 0");
    labtest::expectEqInt("KMP 主串与模式串均为空", 0,
        kmpMatch("", ""),
        "空模式串优先返回 0");
    labtest::expectEqInt("KMP 主串为空模式串非空", -1,
        kmpMatch("", "a"),
        "主串短于模式串应返回 -1");
    labtest::expectEqInt("KMP 模式串比主串长", -1,
        kmpMatch("abc", "abcdef"),
        "模式串长度大于主串时直接返回 -1");

    // ---------- 4. 回溯法迷宫测试 ----------
    std::vector<std::vector<int>> maze1 = {
        {0, 0, 1, 0, 0},
        {0, 0, 0, 0, 1},
        {1, 1, 0, 1, 0},
        {0, 0, 0, 0, 0},
        {0, 1, 1, 1, 0}
    };
    labtest::expectTrue("迷宫有路（含环路与死胡同）",
        solveMaze(maze1, 0, 0, 4, 4) == true,
        "检查四方向探索、visited 标记（左上 2x2 是环路，无 visited 会死循环）及终点判断");

    std::vector<std::vector<int>> maze2 = {
        {0, 0, 1, 0},
        {0, 1, 1, 0},
        {0, 0, 1, 0},
        {1, 1, 1, 0}
    };
    labtest::expectTrue("迷宫无路（被墙完全隔断）",
        solveMaze(maze2, 0, 0, 3, 3) == false,
        "四个方向都走不通时应正确回溯并返回 false");

    labtest::expectTrue("迷宫起点即终点（通路）",
        solveMaze(maze1, 0, 0, 0, 0) == true,
        "起点等于终点且该格是 0 时应直接返回 true");

    labtest::expectTrue("迷宫终点是墙",
        solveMaze(maze1, 0, 0, 0, 2) == false,
        "终点本身是墙(1)时不能到达，应返回 false");

    labtest::expectTrue("迷宫起点是墙",
        solveMaze(maze1, 0, 2, 4, 4) == false,
        "起点本身是墙(1)时无法出发，应返回 false");

    labtest::expectTrue("迷宫起点或终点越界",
        solveMaze(maze1, -1, 0, 4, 4) == false && solveMaze(maze1, 0, 0, 5, 4) == false,
        "访问 grid[sr][sc] / grid[tr][tc] 前必须先做坐标越界检查！");

    // ---------- 5. 0-1 背包 DP 测试 ----------
    labtest::expectEqInt("0-1 背包经典用例 W=8", 10,
        knapsack01({2, 3, 4, 5}, {3, 4, 5, 6}, 8),
        "选重量 3(价值4) + 重量 5(价值6) = 总重8、总价值10，检查状态转移公式");

    labtest::expectEqInt("0-1 背包防重复选择检测（内层必须倒序）", 6,
        knapsack01({2, 3}, {5, 6}, 4),
        "若算出 10 说明你内层写了正序循环，把重量2的物品重复装了两次！请改为 c 从 W 倒序到 weight[i]");

    labtest::expectEqInt("0-1 背包经典 4 件物品 W=5", 8,
        knapsack01({1, 2, 3, 4}, {2, 4, 4, 5}, 5),
        "选重量 2(价值4) + 重量 3(价值4) = 总重5、总价值8（比贪心选单位价值最高的 1+2 得6 更优）");

    labtest::expectEqInt("0-1 背包容量 W=0", 0,
        knapsack01({1, 2, 3}, {10, 20, 30}, 0),
        "容量为 0 时什么都装不下，应返回 0");

    labtest::expectEqInt("0-1 背包空物品列表", 0,
        knapsack01({}, {}, 10),
        "没有物品时最大价值应为 0");

    labtest::expectEqInt("0-1 背包单件超重", 0,
        knapsack01({10}, {100}, 5),
        "物品重量大于背包容量 W 时无法装入，应返回 0 且不可数组越界");

    labtest::expectEqInt("0-1 背包全部装得下", 60,
        knapsack01({1, 2, 3}, {10, 20, 30}, 10),
        "总重 6 <= 10，应能全装下得 60");

    return labtest::endLab();
}
