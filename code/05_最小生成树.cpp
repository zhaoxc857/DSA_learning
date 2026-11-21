// ============================================================
// 05_最小生成树.cpp
// 配套笔记：第 5 章 图 → 5.4 最小生成树
//
// 内容：Prim 算法 + Kruskal 算法（含并查集）
//       并对比两种算法的结果
//
// 编译运行：
//   g++ -std=c++11 05_最小生成树.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <string>
#include <iomanip>
using namespace std;

const int INF = 1e9;

// ============================================================
// 一、Prim 算法（从"点"出发）
// ============================================================
struct PrimResult {
    int totalWeight;
    vector<pair<int,int>> edges;    // 最小生成树的边
};

PrimResult prim(const vector<vector<int>>& g, int n) {
    PrimResult res{0, {}};

    vector<int> dist(n, INF);         // 到生成树的最短距离
    vector<int> parent(n, -1);        // 记录是从哪个点连过来的
    vector<bool> inTree(n, false);

    dist[0] = 0;

    cout << "  Prim 过程（从顶点 0 开始）：" << endl;
    cout << "    轮次  选中顶点  边权  累计" << endl;

    for (int i = 0; i < n; i++) {
        // ① 找未在树中、距离最小的顶点
        int u = -1;
        for (int j = 0; j < n; j++) {
            if (!inTree[j] && (u == -1 || dist[j] < dist[u])) u = j;
        }
        if (u == -1 || dist[u] == INF) {
            cout << "    → 图不连通！" << endl;
            break;
        }

        // ② 加入生成树
        inTree[u] = true;
        res.totalWeight += dist[u];
        if (parent[u] != -1) {
            res.edges.push_back({parent[u], u});
        }

        cout << "    " << i + 1 << "     " << u << "       "
             << (dist[u] == INF ? -1 : dist[u]) << "     "
             << res.totalWeight << endl;

        // ③ 更新邻居
        for (int v = 0; v < n; v++) {
            if (!inTree[v] && g[u][v] != INF && g[u][v] < dist[v]) {
                dist[v] = g[u][v];
                parent[v] = u;
            }
        }
    }
    return res;
}

// ============================================================
// 二、Kruskal 算法（从"边"出发）
// ============================================================

// ---------- 边 ----------
struct Edge {
    int from, to, weight;
};

// ---------- 并查集 ----------
class UnionFind {
private:
    vector<int> parent;
    vector<int> rank_;

public:
    UnionFind(int n) {
        parent.resize(n);
        rank_.assign(n, 0);
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    // 查找（带路径压缩）
    int find(int x) {
        if (parent[x] != x) {
            parent[x] = find(parent[x]);   // ★ 路径压缩
        }
        return parent[x];
    }

    // 合并（按秩合并）
    bool unite(int x, int y) {
        int rx = find(x), ry = find(y);
        if (rx == ry) return false;        // 同一集合 → 会成环

        if (rank_[rx] < rank_[ry]) {
            parent[rx] = ry;
        } else if (rank_[rx] > rank_[ry]) {
            parent[ry] = rx;
        } else {
            parent[ry] = rx;
            rank_[rx]++;
        }
        return true;
    }
};

struct KruskalResult {
    int totalWeight;
    vector<Edge> edges;
    int examined;                       // 考察过的边数
    int skipped;                        // 因成环跳过的边数
};

KruskalResult kruskal(vector<Edge>& edges, int n) {
    KruskalResult res{0, {}, 0, 0};

    // ① 按权值排序
    sort(edges.begin(), edges.end(),
         [](const Edge& a, const Edge& b) { return a.weight < b.weight; });

    cout << "  排序后的边：" << endl;
    for (const Edge& e : edges) {
        cout << "    " << e.from << " - " << e.to
             << " (权值 " << e.weight << ")" << endl;
    }
    cout << endl;

    UnionFind uf(n);
    int count = 0;

    cout << "  考察过程：" << endl;
    cout << "    边          权值  判断" << endl;

    for (const Edge& e : edges) {
        res.examined++;
        bool added = uf.unite(e.from, e.to);

        cout << "    " << e.from << " - " << e.to << "        "
             << setw(3) << e.weight << "   "
             << (added ? "加入 ✓" : "成环，跳过 ✗") << endl;

        if (added) {
            res.totalWeight += e.weight;
            res.edges.push_back(e);
            count++;
            if (count == n - 1) break;      // 已够 n-1 条边
        } else {
            res.skipped++;
        }
    }
    return res;
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  最小生成树：Prim vs Kruskal" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 构建图 ----------
    // 教材风格的例子：
    //        A
    //      / | \
    //     6  1  5
    //    /   |   \
    //   B    C    D
    //   |   / \   |
    //   5  5   6  2
    //   | /     \ |
    //   E ───4─── F
    int n = 6;
    const char* name[] = {"A","B","C","D","E","F"};

    vector<vector<int>> g(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) g[i][i] = 0;

    auto setEdge = [&](int i, int j, int w) {
        g[i][j] = w; g[j][i] = w;
    };
    setEdge(0, 1, 6);   // A-B
    setEdge(0, 2, 1);   // A-C
    setEdge(0, 3, 5);   // A-D
    setEdge(1, 4, 5);   // B-E
    setEdge(2, 4, 5);   // C-E
    setEdge(2, 5, 6);   // C-F
    setEdge(3, 5, 2);   // D-F
    setEdge(4, 5, 4);   // E-F

    cout << "【图的边和权值】" << endl;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (g[i][j] != INF) {
                cout << "  " << name[i] << " - " << name[j]
                     << " : " << g[i][j] << endl;
            }
        }
    }
    cout << endl;

    // ---------- 1. Prim ----------
    cout << "【1. Prim 算法】" << endl;
    cout << "----------------------------------------" << endl;
    PrimResult pr = prim(g, n);
    cout << endl;
    cout << "  最小生成树的边：" << endl;
    for (auto& e : pr.edges) {
        cout << "    " << name[e.first] << " - " << name[e.second]
             << " (权值 " << g[e.first][e.second] << ")" << endl;
    }
    cout << "  总权值 = " << pr.totalWeight << endl << endl;

    // ---------- 2. Kruskal ----------
    cout << "【2. Kruskal 算法】" << endl;
    cout << "----------------------------------------" << endl;

    vector<Edge> edges;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (g[i][j] != INF) {
                edges.push_back({i, j, g[i][j]});
            }
        }
    }

    KruskalResult kr = kruskal(edges, n);
    cout << endl;
    cout << "  最小生成树的边：" << endl;
    for (auto& e : kr.edges) {
        cout << "    " << name[e.from] << " - " << name[e.to]
             << " (权值 " << e.weight << ")" << endl;
    }
    cout << "  总权值 = " << kr.totalWeight << endl;
    cout << "  考察了 " << kr.examined << " 条边，跳过 " << kr.skipped << " 条" << endl;
    cout << endl;

    // ---------- 3. 结果对比 ----------
    cout << "【3. 两种算法结果对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  Prim    总权值 = " << pr.totalWeight << endl;
    cout << "  Kruskal 总权值 = " << kr.totalWeight << endl;
    cout << "  → " << (pr.totalWeight == kr.totalWeight
                       ? "权值相同 ✓（最小生成树权值唯一）"
                       : "权值不同 ✗（有 bug！）") << endl;
    cout << endl;
    cout << "  注：最小生成树可能不唯一（选边顺序不同），" << endl;
    cout << "      但最小权值和是唯一的。" << endl << endl;

    // ---------- 4. 复杂度对比 ----------
    cout << "【4. 复杂度对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  算法      时间复杂度    适合的图" << endl;
    cout << "  Prim      O(n^2)        稠密图（边多）" << endl;
    cout << "  Kruskal   O(e log e)    稀疏图（边少）" << endl;
    cout << endl;

    // ---------- 5. 并查集演示 ----------
    cout << "【5. 并查集（Kruskal 的核心工具）】" << endl;
    cout << "----------------------------------------" << endl;
    UnionFind uf(6);
    cout << "  初始: 每个元素自成一个集合" << endl;
    cout << "    find(0)=" << uf.find(0) << ", find(1)=" << uf.find(1)
         << " → 不同集合" << endl;

    uf.unite(0, 1);
    cout << "  unite(0,1) 后:" << endl;
    cout << "    find(0)=" << uf.find(0) << ", find(1)=" << uf.find(1)
         << " → 同一集合" << endl;

    uf.unite(1, 2);
    cout << "  unite(1,2) 后:" << endl;
    cout << "    find(0)=" << uf.find(0) << ", find(2)=" << uf.find(2)
         << " → 同一集合（0-1-2 连通了）" << endl;

    bool cycle = !uf.unite(0, 2);
    cout << "  unite(0,2): " << (cycle ? "返回 false（会成环）" : "返回 true") << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. Prim 从点出发：每次加入最近的顶点" << endl;
    cout << "  2. Kruskal 从边出发：排序后依次加边，用并查集判环" << endl;
    cout << "  3. 两者结果权值相同（最小生成树权值唯一）" << endl;
    cout << "  4. 稠密图用 Prim，稀疏图用 Kruskal" << endl;
    cout << "========================================" << endl;

    return 0;
}
