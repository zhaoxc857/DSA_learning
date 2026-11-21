// ============================================================================
// 关卡 06：KMP 串模式匹配 + 迷宫回溯 + 0-1 背包动态规划（参考答案）
// 对应教材：第 3 章 3.4 串模式匹配 / KMP + 3.6 四大经典算法思想
// ============================================================================

#include "../common/test_kit.h"
#include <algorithm>
#include <string>
#include <vector>

// 任务 1：暴力模式匹配（Brute-Force）
int bfMatch(const std::string& text, const std::string& pat) {
    int n = static_cast<int>(text.size());
    int m = static_cast<int>(pat.size());
    if (m == 0) {
        return 0;
    }
    if (m > n) {
        return -1;
    }
    for (int i = 0; i <= n - m; ++i) {
        int j = 0;
        while (j < m && text[i + j] == pat[j]) {
            ++j;
        }
        if (j == m) {
            return i;
        }
    }
    return -1;
}

// 任务 2：构造 KMP 前缀函数 / next 数组（0-based LPS）
std::vector<int> buildNext(const std::string& pat) {
    int m = static_cast<int>(pat.size());
    if (m == 0) {
        return {};
    }
    std::vector<int> next(m, 0);
    int j = 0; // 当前已匹配前缀长度，也是前缀下一个待比较字符下标
    for (int i = 1; i < m; ++i) {
        // 失配时沿真前后缀长度回退，寻找次长候选前缀
        while (j > 0 && pat[i] != pat[j]) {
            j = next[j - 1];
        }
        if (pat[i] == pat[j]) {
            ++j;
        }
        next[i] = j;
    }
    return next;
}

// 任务 3：KMP 串模式匹配
int kmpMatch(const std::string& text, const std::string& pat) {
    int n = static_cast<int>(text.size());
    int m = static_cast<int>(pat.size());
    if (m == 0) {
        return 0;
    }
    if (m > n) {
        return -1;
    }

    std::vector<int> next = buildNext(pat);
    int j = 0;
    for (int i = 0; i < n; ++i) {
        while (j > 0 && text[i] != pat[j]) {
            j = next[j - 1];
        }
        if (text[i] == pat[j]) {
            ++j;
        }
        if (j == m) {
            return i - m + 1;
        }
    }
    return -1;
}

// 任务 4 辅助递归函数：四方向 DFS 搜索迷宫
static bool dfsMaze(const std::vector<std::vector<int>>& grid,
                    std::vector<std::vector<int>>& visited,
                    int r, int c, int tr, int tc) {
    if (r == tr && c == tc) {
        return true;
    }
    visited[r][c] = 1;

    static const int dr[4] = {-1, 1, 0, 0};
    static const int dc[4] = {0, 0, -1, 1};
    int rows = static_cast<int>(grid.size());
    int cols = static_cast<int>(grid[0].size());

    for (int d = 0; d < 4; ++d) {
        int nr = r + dr[d];
        int nc = c + dc[d];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
            grid[nr][nc] == 0 && visited[nr][nc] == 0) {
            if (dfsMaze(grid, visited, nr, nc, tr, tc)) {
                return true;
            }
        }
    }
    return false;
}

// 任务 4：回溯法迷宫求解
bool solveMaze(const std::vector<std::vector<int>>& grid, int sr, int sc, int tr, int tc) {
    if (grid.empty() || grid[0].empty()) {
        return false;
    }
    int rows = static_cast<int>(grid.size());
    int cols = static_cast<int>(grid[0].size());

    if (sr < 0 || sr >= rows || sc < 0 || sc >= cols ||
        tr < 0 || tr >= rows || tc < 0 || tc >= cols) {
        return false;
    }
    if (grid[sr][sc] == 1 || grid[tr][tc] == 1) {
        return false;
    }

    std::vector<std::vector<int>> visited(rows, std::vector<int>(cols, 0));
    return dfsMaze(grid, visited, sr, sc, tr, tc);
}

// 任务 5：0-1 背包问题（一维滚动数组动态规划）
int knapsack01(const std::vector<int>& weight, const std::vector<int>& value, int W) {
    if (W <= 0 || weight.empty()) {
        return 0;
    }
    int n = static_cast<int>(weight.size());
    std::vector<int> dp(W + 1, 0);

    for (int i = 0; i < n; ++i) {
        // 倒序遍历容量，确保每件物品至多被放入一次
        for (int c = W; c >= weight[i]; --c) {
            dp[c] = std::max(dp[c], dp[c - weight[i]] + value[i]);
        }
    }
    return dp[W];
}

// ============================================================================
// 自动测试套件（与 lab06_todo.cpp 保持完全一致）
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
