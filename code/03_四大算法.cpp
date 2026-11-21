// ============================================================
// 03_四大算法.cpp
// 配套笔记：第 3 章 线性表的扩展 → 3.6 基于栈的经典算法
//
// 内容：递归（斐波那契）、分治（汉诺塔）、回溯（迷宫）、动态规划（背包）
//
// 编译运行：
//   g++ -std=c++11 03_四大算法.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <chrono>
using namespace std;

// ============================================================
// 一、递归 —— 斐波那契数列
// ============================================================

// ① 朴素递归：O(2^n)，慢得可怕
long long fibSlow(int n) {
    if (n <= 1) return n;
    return fibSlow(n - 1) + fibSlow(n - 2);
}

// ② 记忆化搜索（自顶向下 DP）：O(n)
vector<long long> memo;
long long fibMemo(int n) {
    if (n <= 1) return n;
    if (memo[n] != -1) return memo[n];        // ★ 已经算过，直接返回
    return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
}

// ③ 递推（自底向上 DP）：O(n)，空间 O(1)
long long fibFast(int n) {
    if (n <= 1) return n;
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long c = a + b;
        a = b;
        b = c;
    }
    return b;
}

// ============================================================
// 二、分治 —— 汉诺塔
// ============================================================
long long hanoiCount = 0;    // 统计移动次数

void hanoi(int n, char from, char to, char via,
           bool verbose = false) {
    if (n == 1) {
        hanoiCount++;
        if (verbose)
            cout << "    移动盘子 1: " << from << " → " << to << endl;
        return;
    }
    // ① 把上面 n-1 个从 from 移到 via（借助 to）
    hanoi(n - 1, from, via, to, verbose);

    // ② 把最大的盘子从 from 移到 to
    hanoiCount++;
    if (verbose)
        cout << "    移动盘子 " << n << ": " << from << " → " << to << endl;

    // ③ 把 n-1 个从 via 移到 to（借助 from）
    hanoi(n - 1, via, to, from, verbose);
}

// ============================================================
// 三、回溯 —— 迷宫问题
// ============================================================
const int R = 5, C = 5;
int maze[R][C] = {
    {0, 1, 0, 0, 0},
    {0, 1, 0, 1, 0},
    {0, 0, 0, 1, 0},
    {1, 1, 0, 0, 0},
    {0, 0, 0, 1, 0}
};
int visited[R][C] = {0};
vector<pair<int,int>> path;

bool canGo(int x, int y) {
    return x >= 0 && x < R && y >= 0 && y < C &&
           maze[x][y] == 0 && visited[x][y] == 0;
}

bool dfs(int x, int y, bool verbose) {
    if (x == R - 1 && y == C - 1) {      // 到达终点
        visited[x][y] = 1;
        path.push_back({x, y});
        return true;
    }
    if (!canGo(x, y)) return false;

    visited[x][y] = 1;                   // 标记来过
    path.push_back({x, y});
    if (verbose) cout << "    走到 (" << x << "," << y << ")" << endl;

    // 尝试四个方向：下、右、上、左
    if (dfs(x + 1, y, verbose)) return true;
    if (dfs(x, y + 1, verbose)) return true;
    if (dfs(x - 1, y, verbose)) return true;
    if (dfs(x, y - 1, verbose)) return true;

    // ★ 四个方向都走不通 → 回溯
    visited[x][y] = 0;                   // 撤销标记
    path.pop_back();
    if (verbose) cout << "    (" << x << "," << y << ") 走不通，回溯" << endl;
    return false;
}

void printMaze() {
    for (int i = 0; i < R; i++) {
        cout << "    ";
        for (int j = 0; j < C; j++) {
            bool onPath = false;
            for (auto& p : path)
                if (p.first == i && p.second == j) { onPath = true; break; }
            if (onPath)      cout << "* ";
            else if (maze[i][j] == 1) cout << "# ";
            else             cout << ". ";
        }
        cout << endl;
    }
}

// ============================================================
// 四、动态规划 —— 0-1 背包
// ============================================================
int knapsack(int n, int C, const vector<int>& w, const vector<int>& v,
             bool printTable = false) {
    // dp[i][c]: 前 i 个物品，容量 c 的最大价值
    vector<vector<int>> dp(n + 1, vector<int>(C + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int c = 0; c <= C; c++) {
            dp[i][c] = dp[i - 1][c];              // 不拿第 i 个
            if (c >= w[i - 1]) {                  // 拿第 i 个（能装下）
                dp[i][c] = max(dp[i][c],
                               dp[i - 1][c - w[i - 1]] + v[i - 1]);
            }
        }
    }

    if (printTable) {
        cout << "    dp 表（行=物品，列=容量）：" << endl;
        cout << "      ";
        for (int c = 0; c <= C; c++) cout << c << "  ";
        cout << endl;
        for (int i = 0; i <= n; i++) {
            cout << "    i=" << i << " ";
            for (int c = 0; c <= C; c++) {
                cout << dp[i][c];
                if (dp[i][c] < 10) cout << "  ";
                else cout << " ";
            }
            cout << endl;
        }

        // 回溯找出选了哪些物品
        cout << "    选中的物品: ";
        int c = C;
        for (int i = n; i >= 1; i--) {
            if (dp[i][c] != dp[i - 1][c]) {
                cout << i << "(w=" << w[i-1] << ",v=" << v[i-1] << ") ";
                c -= w[i - 1];
            }
        }
        cout << endl;
    }

    return dp[n][C];
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  四大经典算法演示" << endl;
    cout << "========================================" << endl << endl;

    // ================= 一、递归 =================
    cout << "【一、递归 —— 斐波那契数列】" << endl;
    cout << "  数列: 1 1 2 3 5 8 13 21 34 55 ..." << endl << endl;

    cout << "  ① 朴素递归（O(2^n)）耗时测试：" << endl;
    for (int n : {20, 25, 30, 35}) {
        auto t0 = chrono::high_resolution_clock::now();
        long long r = fibSlow(n);
        auto t1 = chrono::high_resolution_clock::now();
        auto ms = chrono::duration_cast<chrono::milliseconds>(t1 - t0).count();
        cout << "     fib(" << n << ") = " << r
             << "  耗时 " << ms << " ms" << endl;
    }
    cout << "    → 注意耗时增长：n 每 +5，时间约 ×2^n，指数爆炸！" << endl << endl;

    cout << "  ② 记忆化搜索 / 递推（O(n)）:" << endl;
    memo.assign(100, -1);
    for (int n : {30, 50, 90}) {
        auto t0 = chrono::high_resolution_clock::now();
        long long r = fibFast(n);
        auto t1 = chrono::high_resolution_clock::now();
        auto us = chrono::duration_cast<chrono::microseconds>(t1 - t0).count();
        cout << "     fib(" << n << ") = " << r
             << "  耗时 " << us << " 微秒" << endl;
    }
    cout << "    → n=90 也是一瞬间！这就是消除重复计算的威力" << endl << endl;

    // ================= 二、分治 =================
    cout << "【二、分治 —— 汉诺塔】" << endl;
    cout << "  规则：每次移一个盘子，大盘不能压小盘" << endl << endl;

    cout << "  n=3 的完整移动过程:" << endl;
    hanoiCount = 0;
    hanoi(3, 'A', 'C', 'B', true);
    cout << "  共移动 " << hanoiCount << " 次（2^3 - 1 = 7）" << endl << endl;

    cout << "  移动次数随 n 的增长（2^n - 1）:" << endl;
    for (int n = 1; n <= 10; n++) {
        hanoiCount = 0;
        hanoi(n, 'A', 'C', 'B', false);
        cout << "     n=" << n << " → " << hanoiCount << " 次" << endl;
    }
    cout << "     n=64 → 约 1.8 × 10^19 次（按每秒一次要 5800 亿年）" << endl << endl;

    // ================= 三、回溯 =================
    cout << "【三、回溯 —— 迷宫问题】" << endl;
    cout << "  # = 墙, . = 通路, * = 最终路径" << endl << endl;

    cout << "  迷宫地图:" << endl;
    for (int i = 0; i < R; i++) {
        cout << "    ";
        for (int j = 0; j < C; j++) {
            cout << (maze[i][j] ? "# " : ". ");
        }
        cout << endl;
    }
    cout << endl;

    // 复位
    for (int i = 0; i < R; i++)
        for (int j = 0; j < C; j++) visited[i][j] = 0;
    path.clear();

    cout << "  寻路过程（前 12 步）:" << endl;
    bool found = dfs(0, 0, true);
    cout << endl;

    cout << "  结果: " << (found ? "找到路径 ✓" : "无解 ✗") << endl;
    cout << "  路径长度 = " << path.size() << " 步" << endl;
    cout << "  路径图:" << endl;
    printMaze();
    cout << endl;

    // ================= 四、动态规划 =================
    cout << "【四、动态规划 —— 0-1 背包】" << endl;

    // 例1
    {
        vector<int> w = {2, 3, 4};
        vector<int> v = {3, 4, 5};
        int C = 5;
        cout << "  例1: 容量 C=5" << endl;
        cout << "       物品: ";
        for (size_t i = 0; i < w.size(); i++)
            cout << i+1 << "(w=" << w[i] << ",v=" << v[i] << ") ";
        cout << endl;
        int ans = knapsack(w.size(), C, w, v, true);
        cout << "  → 最大价值 = " << ans << endl << endl;
    }

    // 例2
    {
        vector<int> w = {1, 2, 3};
        vector<int> v = {6, 10, 12};
        int C = 5;
        cout << "  例2: 容量 C=5" << endl;
        cout << "       物品: ";
        for (size_t i = 0; i < w.size(); i++)
            cout << i+1 << "(w=" << w[i] << ",v=" << v[i] << ") ";
        cout << endl;
        int ans = knapsack(w.size(), C, w, v, true);
        cout << "  → 最大价值 = " << ans << endl << endl;
    }

    // 例3：贪心会失败的例子
    {
        vector<int> w = {3, 4, 5};
        vector<int> v = {4, 5, 6};
        int C = 8;
        cout << "  例3（贪心会错的例子）: 容量 C=8" << endl;
        cout << "       物品: ";
        for (size_t i = 0; i < w.size(); i++)
            cout << i+1 << "(w=" << w[i] << ",v=" << v[i] << ") ";
        cout << endl;
        int ans = knapsack(w.size(), C, w, v, true);
        cout << "  → DP 最优解 = " << ans << endl;
        cout << "     （贪心按性价比会先拿物品1，得到 9，不是最优）" << endl << endl;
    }

    cout << "========================================" << endl;
    cout << "  总结：" << endl;
    cout << "  递归   - 自己调用自己，靠栈实现" << endl;
    cout << "  分治   - 大问题拆成独立小问题" << endl;
    cout << "  回溯   - 试探 + 撤销，走不通就回头" << endl;
    cout << "  动态规划 - 拆成重叠子问题 + 记住答案" << endl;
    cout << "========================================" << endl;

    return 0;
}
