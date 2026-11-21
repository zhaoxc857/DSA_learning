// ============================================================
// 05_最短路径.cpp
// 配套笔记：第 5 章 图 → 5.5 最短路径
//
// 内容：Dijkstra（单源）+ Floyd（多源）
//       并验证两者结果一致
//
// 编译运行：
//   g++ -std=c++11 05_最短路径.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <iomanip>
#include <algorithm>
using namespace std;

const int INF = 1e9;

// ============================================================
// 一、Dijkstra 算法（单源最短路径）
// ============================================================
vector<int> dijkstra(const vector<vector<int>>& g, int n, int start,
                     bool verbose = false) {
    vector<int> dist(n, INF);
    vector<int> parent(n, -1);        // 记录路径
    vector<bool> visited(n, false);

    dist[start] = 0;

    if (verbose) {
        cout << "    轮次  选中  距离  更新" << endl;
    }

    for (int i = 0; i < n; i++) {
        // ① 找未访问中 dist 最小的
        int u = -1;
        for (int j = 0; j < n; j++) {
            if (!visited[j] && (u == -1 || dist[j] < dist[u])) u = j;
        }
        if (u == -1 || dist[u] == INF) break;

        // ② 标记
        visited[u] = true;

        if (verbose) {
            cout << "    " << i + 1 << "     " << u
                 << "     " << dist[u] << "    ";
        }

        // ③ 松弛
        bool anyUpdate = false;
        for (int v = 0; v < n; v++) {
            if (!visited[v] && g[u][v] != INF) {
                if (dist[u] + g[u][v] < dist[v]) {
                    dist[v] = dist[u] + g[u][v];
                    parent[v] = u;
                    anyUpdate = true;
                }
            }
        }
        if (verbose) {
            cout << (anyUpdate ? "有" : "无") << endl;
        }
    }
    return dist;
}

// ---------- 重建路径 ----------
vector<int> buildPath(const vector<int>& dist, int start, int end,
                      const vector<vector<int>>& g, int n) {
    // 简单做法：反向查找
    vector<int> path;
    // 用 dijkstra 的 parent 数组更好，这里简化：重新计算一次
    vector<int> par(n, -1);
    vector<bool> vis(n, false);
    vector<int> d(n, INF);
    d[start] = 0;

    for (int i = 0; i < n; i++) {
        int u = -1;
        for (int j = 0; j < n; j++)
            if (!vis[j] && (u == -1 || d[j] < d[u])) u = j;
        if (u == -1 || d[u] == INF) break;
        vis[u] = true;
        for (int v = 0; v < n; v++) {
            if (!vis[v] && g[u][v] != INF && d[u] + g[u][v] < d[v]) {
                d[v] = d[u] + g[u][v];
                par[v] = u;
            }
        }
    }

    if (d[end] == INF) return {};
    for (int cur = end; cur != -1; cur = par[cur]) {
        path.push_back(cur);
        if (cur == start) break;
    }
    reverse(path.begin(), path.end());
    return path;
}

// ============================================================
// 二、Floyd 算法（多源最短路径）
// ============================================================
void floyd(vector<vector<int>>& dist, int n, bool verbose = false) {
    if (verbose) {
        cout << "    k=0 初始矩阵：" << endl;
    }

    for (int k = 0; k < n; k++) {
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (dist[i][k] != INF && dist[k][j] != INF) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                    }
                }
            }
        }
        if (verbose) {
            cout << "    k=" << k << " 处理后完成" << endl;
        }
    }
}

// ---------- 打印矩阵 ----------
void printMatrix(const vector<vector<int>>& d, int n,
                 const vector<char>& name, const string& title) {
    cout << "  " << title << "：" << endl << "       ";
    for (int i = 0; i < n; i++) cout << setw(6) << name[i];
    cout << endl;
    for (int i = 0; i < n; i++) {
        cout << "  " << name[i] << "  ";
        for (int j = 0; j < n; j++) {
            if (d[i][j] == INF) cout << setw(6) << "∞";
            else                cout << setw(6) << d[i][j];
        }
        cout << endl;
    }
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  最短路径：Dijkstra vs Floyd" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 构建图 ----------
    //    A ──4── B
    //    │       │
    //    2       1
    //    │       │
    //    C ──3── D
    int n = 4;
    vector<char> name = {'A', 'B', 'C', 'D'};

    vector<vector<int>> g(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) g[i][i] = 0;

    g[0][1] = g[1][0] = 4;   // A-B
    g[0][2] = g[2][0] = 2;   // A-C
    g[1][3] = g[3][1] = 1;   // B-D
    g[2][3] = g[3][2] = 3;   // C-D

    cout << "【图的结构】" << endl;
    cout << "    A ──4── B" << endl;
    cout << "    │       │" << endl;
    cout << "    2       1" << endl;
    cout << "    │       │" << endl;
    cout << "    C ──3── D" << endl << endl;

    printMatrix(g, n, name, "邻接矩阵");
    cout << endl;

    // ---------- 1. Dijkstra ----------
    cout << "【1. Dijkstra 算法（单源，从 A 出发）】" << endl;
    cout << "----------------------------------------" << endl;
    vector<int> dist = dijkstra(g, n, 0, true);
    cout << endl;

    cout << "  从 A 到各点的最短距离：" << endl;
    for (int i = 0; i < n; i++) {
        cout << "    A → " << name[i] << " = ";
        if (dist[i] == INF) cout << "不可达";
        else                cout << dist[i];

        if (i != 0 && dist[i] != INF) {
            vector<int> p = buildPath(dist, 0, i, g, n);
            cout << "   路径: ";
            for (size_t k = 0; k < p.size(); k++) {
                cout << name[p[k]];
                if (k + 1 < p.size()) cout << "→";
            }
        }
        cout << endl;
    }
    cout << endl;

    // ---------- 2. Floyd ----------
    cout << "【2. Floyd 算法（多源，所有点对）】" << endl;
    cout << "----------------------------------------" << endl;

    vector<vector<int>> d = g;      // 拷贝一份
    floyd(d, n, true);
    cout << endl;

    printMatrix(d, n, name, "所有点对的最短距离");
    cout << endl;

    // ---------- 3. 交叉验证 ----------
    cout << "【3. 两种算法交叉验证】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  比较 A 到各点的距离：" << endl;
    bool allMatch = true;
    for (int i = 0; i < n; i++) {
        bool match = (dist[i] == d[0][i]);
        if (!match) allMatch = false;
        cout << "    A → " << name[i] << ": Dijkstra="
             << (dist[i] == INF ? -1 : dist[i])
             << ", Floyd=" << (d[0][i] == INF ? -1 : d[0][i])
             << (match ? "  ✓" : "  ✗") << endl;
    }
    cout << "  → " << (allMatch ? "结果完全一致 ✓" : "有差异 ✗") << endl;
    cout << endl;

    // ---------- 4. 一个更复杂的例子 ----------
    cout << "【4. 更复杂的图（5 个顶点）】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "    A ──10── B" << endl;
    cout << "    │      / │" << endl;
    cout << "    3     5  1" << endl;
    cout << "    │   /    │" << endl;
    cout << "    C ──2─── D" << endl;
    cout << "    │        │" << endl;
    cout << "    8        4" << endl;
    cout << "    │        │" << endl;
    cout << "    E ────────" << endl << endl;

    int n2 = 5;
    vector<char> name2 = {'A','B','C','D','E'};
    vector<vector<int>> g2(n2, vector<int>(n2, INF));
    for (int i = 0; i < n2; i++) g2[i][i] = 0;

    auto se = [&](int i, int j, int w) { g2[i][j] = w; g2[j][i] = w; };
    se(0, 1, 10);   // A-B
    se(0, 2, 3);    // A-C
    se(1, 2, 5);    // B-C
    se(1, 3, 1);    // B-D
    se(2, 3, 2);    // C-D
    se(2, 4, 8);    // C-E
    se(3, 4, 4);    // D-E

    printMatrix(g2, n2, name2, "邻接矩阵");
    cout << endl;

    vector<int> dist2 = dijkstra(g2, n2, 0);
    cout << "  从 A 出发的最短距离（Dijkstra）：" << endl;
    for (int i = 0; i < n2; i++) {
        cout << "    A → " << name2[i] << " = " << dist2[i] << endl;
    }
    cout << endl;

    vector<vector<int>> d2 = g2;
    floyd(d2, n2);
    cout << "  从 A 出发的最短距离（Floyd）：" << endl;
    for (int i = 0; i < n2; i++) {
        cout << "    A → " << name2[i] << " = " << d2[0][i] << endl;
    }
    cout << endl;

    cout << "  关键结果：A → E 最短 = " << dist2[4]
         << "（路径 A→C→D→E = 3+2+4 = 9）" << endl;
    cout << endl;

    // ---------- 5. 复杂度对比 ----------
    cout << "【5. 复杂度对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  算法       解决       时间复杂度   负权边" << endl;
    cout << "  Dijkstra   单源       O(n^2)       不支持" << endl;
    cout << "  Floyd      多源       O(n^3)       支持" << endl;
    cout << endl;
    cout << "  选择建议：" << endl;
    cout << "    - 只求一个源点到其他点 → Dijkstra（更快）" << endl;
    cout << "    - 求所有点对之间 → Floyd（一次搞定）" << endl;
    cout << "    - 有负权边 → 必须用 Floyd 或 Bellman-Ford" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. Dijkstra 是贪心，Floyd 是动态规划" << endl;
    cout << "  2. Dijkstra 不能有负权边" << endl;
    cout << "  3. Floyd 的三重循环，k 必须在最外层" << endl;
    cout << "  4. 松弛操作：找到更短路就更新" << endl;
    cout << "========================================" << endl;

    return 0;
}
