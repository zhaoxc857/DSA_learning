// ============================================================================
// 第 13 关（进阶 2）：图的进阶算法（Kruskal 并查集 + Floyd + 拓扑排序判环）【参考答案】
// 对应教材：5.4.2（Kruskal） + 5.5.2（Floyd） + 5.6 问题 3（AOV 网拓扑排序）
// ============================================================================

#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：并查集（DSU） + Kruskal 最小生成树（教材 5.4.2）
// ============================================================================

struct KEdge {
    int u; // 端点 1（0 .. n-1）
    int v; // 端点 2（0 .. n-1）
    int w; // 边权
};

struct DSU {
    std::vector<int> parent; // parent[x] 表示 x 的父节点；根节点的 parent[r] == r
};

void dsuInit(DSU& d, int n) {
    d.parent.resize(n);
    for (int i = 0; i < n; ++i) {
        d.parent[i] = i;
    }
}

int dsuFind(DSU& d, int x) {
    if (d.parent[x] != x) {
        d.parent[x] = dsuFind(d, d.parent[x]);
    }
    return d.parent[x];
}

bool dsuUnion(DSU& d, int a, int b) {
    int ra = dsuFind(d, a);
    int rb = dsuFind(d, b);
    if (ra == rb) {
        return false;
    }
    d.parent[ra] = rb;
    return true;
}

int kruskalMST(int n, std::vector<KEdge> edges) {
    if (n <= 1) {
        return 0;
    }
    std::sort(edges.begin(), edges.end(),
              [](const KEdge& a, const KEdge& b) { return a.w < b.w; });

    DSU d;
    dsuInit(d, n);
    int totalWeight = 0;
    int picked = 0;
    for (size_t i = 0; i < edges.size(); ++i) {
        if (dsuUnion(d, edges[i].u, edges[i].v)) {
            totalWeight += edges[i].w;
            ++picked;
            if (picked == n - 1) {
                break;
            }
        }
    }
    return (picked == n - 1) ? totalWeight : -1;
}

// ============================================================================
// Part B：Floyd-Warshall 全源最短路径（教材 5.5.2）
// ============================================================================

const int INF = 1000000000;

std::vector<std::vector<int>> floydAllPairs(int n, std::vector<std::vector<int>> dist) {
    for (int k = 0; k < n; ++k) {
        for (int i = 0; i < n; ++i) {
            if (dist[i][k] >= INF) {
                continue;
            }
            for (int j = 0; j < n; ++j) {
                if (dist[k][j] >= INF) {
                    continue;
                }
                if (dist[i][k] + dist[k][j] < dist[i][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    return dist;
}

// ============================================================================
// Part C：AOV 网拓扑排序 + 环路检测（教材 5.6 问题 3，Kahn 算法）
// ============================================================================

std::vector<int> topoSort(int n, const std::vector<std::pair<int, int>>& edges) {
    std::vector<std::vector<int>> adj(n);
    std::vector<int> indeg(n, 0);
    for (size_t i = 0; i < edges.size(); ++i) {
        int u = edges[i].first;
        int v = edges[i].second;
        adj[u].push_back(v);
        indeg[v]++;
    }

    std::priority_queue<int, std::vector<int>, std::greater<int>> pq;
    for (int i = 0; i < n; ++i) {
        if (indeg[i] == 0) {
            pq.push(i);
        }
    }

    std::vector<int> order;
    order.reserve(n);
    while (!pq.empty()) {
        int u = pq.top();
        pq.pop();
        order.push_back(u);
        for (size_t i = 0; i < adj[u].size(); ++i) {
            int v = adj[u][i];
            if (--indeg[v] == 0) {
                pq.push(v);
            }
        }
    }

    if (static_cast<int>(order.size()) != n) {
        return std::vector<int>();
    }
    return order;
}

// ================================= 自动测试套 =================================

static bool checkMatrixShape(const std::vector<std::vector<int>>& m, int n) {
    if (static_cast<int>(m.size()) != n) return false;
    for (int i = 0; i < n; ++i) {
        if (static_cast<int>(m[i].size()) != n) return false;
    }
    return true;
}

int main() {
    labtest::beginLab("第 13 关：图的进阶算法（Kruskal + Floyd + 拓扑排序）");

    // -------------------- Part A 测试：并查集 + Kruskal --------------------
    {
        DSU d;
        dsuInit(d, 5);
        bool initOk = (d.parent.size() == 5);
        for (int i = 0; initOk && i < 5; ++i) {
            if (d.parent[i] != i) initOk = false;
        }
        labtest::expectTrue("A1. 并查集初始化每个节点 parent[i] == i", initOk,
                            "检查 dsuInit：应 resize(n) 并令 parent[i] = i");

        bool u1 = dsuUnion(d, 0, 1);
        bool u2 = dsuUnion(d, 1, 2);
        bool u3 = dsuUnion(d, 0, 2); // 已同集合
        labtest::expectTrue("A2. 合并不同集合返回 true，重复合并同集合返回 false",
                            u1 && u2 && !u3,
                            "检查 dsuUnion：ra == rb 时必须返回 false，否则合并根节点并返回 true");

        // 测试路径压缩：手动构造链 0 -> 1 -> 2 -> 3 -> 4
        DSU chain;
        chain.parent = {1, 2, 3, 4, 4};
        int root0 = dsuFind(chain, 0);
        bool compressed = (root0 == 4 && chain.parent[0] == 4 && chain.parent[1] == 4 && chain.parent[2] == 4);
        labtest::expectTrue("A3. dsuFind 正确找到根 4 并完成路径压缩", compressed,
                            "检查 dsuFind：需写 d.parent[x] = dsuFind(d, d.parent[x]) 将路径节点直接挂到根下");

        // Kruskal 经典 6 点连通图（MST 边：0-2(1), 3-5(2), 1-4(3), 2-5(4), 2-1(5) -> 总权 15）
        std::vector<KEdge> e1 = {
            {0, 1, 6}, {0, 2, 1}, {0, 3, 5},
            {1, 2, 5}, {1, 4, 3},
            {2, 3, 5}, {2, 4, 6}, {2, 5, 4},
            {3, 5, 2}, {4, 5, 6}
        };
        labtest::expectEqInt("A4. Kruskal 经典 6 点连通图最小生成树总权为 15",
                             15, kruskalMST(6, e1),
                             "检查 kruskalMST：是否按 w 升序排序、用 dsuUnion 选满 n-1 条边并累加权值");

        // 含重边（平行边）和自环的 4 点图：最优边 0-1(2), 1-2(3), 2-3(4) -> 总权 9
        std::vector<KEdge> e2 = {
            {0, 0, 1},           // 自环（不可选！）
            {0, 1, 10}, {0, 1, 2}, // 重边，应选权为 2 的
            {1, 2, 3},  {1, 2, 8},
            {2, 3, 4},  {0, 3, 9}
        };
        labtest::expectEqInt("A5. Kruskal 含重边与自环的 4 点图总权为 9",
                             9, kruskalMST(4, e2),
                             "检查 kruskalMST：自环 (u==v) 和更贵的重边都会被 dsuUnion 判同集合跳过");

        // 非连通图（0-1 连通，2-3 连通，中间断开）
        std::vector<KEdge> e3 = {{0, 1, 2}, {2, 3, 5}};
        labtest::expectEqInt("A6. Kruskal 非连通图返回 -1",
                             -1, kruskalMST(4, e3),
                             "检查 kruskalMST：选出的边数 picked < n - 1 时必须返回 -1");

        // 单点与空图边界
        labtest::expectEqInt("A7. Kruskal 单点图 (n=1) 返回 0",
                             0, kruskalMST(1, {}),
                             "检查 kruskalMST：n <= 1 时不需要任何边，直接返回 0");
        labtest::expectEqInt("A8. Kruskal 空图 (n=0) 返回 0",
                             0, kruskalMST(0, {}),
                             "检查 kruskalMST：n <= 1 边界应返回 0");
    }

    // -------------------- Part B 测试：Floyd 多源最短路 --------------------
    {
        // 用例 1：专门检测「k 必须在最外层」的多跳松弛图！
        // 0 -> 3 (1), 3 -> 2 (1), 2 -> 1 (1), 另有贵直连 0 -> 1 (50)
        // 若误把循环顺序写成 i-j-k，计算 dist[0][1] 时 dist[0][2] 尚未算出来，会导致 dist[0][1] 停留在 50！
        int n1 = 4;
        std::vector<std::vector<int>> g1(n1, std::vector<int>(n1, INF));
        for (int i = 0; i < n1; ++i) g1[i][i] = 0;
        g1[0][3] = 1;
        g1[3][2] = 1;
        g1[2][1] = 1;
        g1[0][1] = 50;

        std::vector<std::vector<int>> r1 = floydAllPairs(n1, g1);
        bool shape1 = checkMatrixShape(r1, n1);
        labtest::expectTrue("B1. Floyd 多跳绕路 0->3->2->1 正确松弛 dist[0][1] == 3",
                            shape1 && r1[0][1] == 3 && r1[0][2] == 2 && r1[3][1] == 2,
                            "检查 floydAllPairs：若 dist[0][1] 仍为 50，说明中转点 k 写到了内层！k 必须在最外层！");
        labtest::expectTrue("B2. Floyd 有向图反向不可达保持 INF（不溢出）",
                            shape1 && r1[1][0] == INF && r1[1][3] == INF && r1[2][0] == INF,
                            "检查 floydAllPairs：相加前必须判断 dist[i][k] < INF && dist[k][j] < INF");

        // 用例 2：5 点一般带权有向图（含完全不可达孤立点 4）
        int n2 = 5;
        std::vector<std::vector<int>> g2(n2, std::vector<int>(n2, INF));
        for (int i = 0; i < n2; ++i) g2[i][i] = 0;
        g2[0][1] = 3;  g2[0][2] = 10;
        g2[1][2] = 2;  g2[1][3] = 8;
        g2[2][3] = 1;  g2[3][0] = 4;
        std::vector<std::vector<int>> r2 = floydAllPairs(n2, g2);
        bool shape2 = checkMatrixShape(r2, n2);
        labtest::expectTrue("B3. Floyd 5 点带环有向图关键点对最短路正确",
                            shape2 && r2[0][3] == 6 && r2[1][0] == 7 && r2[2][1] == 8 && r2[0][0] == 0,
                            "检查 floydAllPairs：0->1->2->3=6, 1->2->3->0=7, 2->3->0->1=8");
        labtest::expectTrue("B4. Floyd 孤立点 4 与其他所有点互不可达（保持 INF）",
                            shape2 && r2[0][4] == INF && r2[4][0] == INF && r2[4][4] == 0,
                            "检查 floydAllPairs：不可达点对不能被错误修改，且对角线保持 0");

        // 用例 3：单点图边界
        std::vector<std::vector<int>> g3 = {{0}};
        std::vector<std::vector<int>> r3 = floydAllPairs(1, g3);
        labtest::expectTrue("B5. Floyd 单点图 (1x1) 返回 [[0]]",
                            checkMatrixShape(r3, 1) && r3[0][0] == 0,
                            "检查 floydAllPairs 单点边界");
    }

    // -------------------- Part C 测试：拓扑排序 + 判环 --------------------
    {
        // 用例 1：DAG 唯一序（多个入度为 0 的点按编号升序出队）
        // 边：2->3, 3->1, 4->0, 4->1, 5->0, 5->2
        // 初始入度 0：4, 5 -> 选 4 -> 选 5 -> 解锁 0, 2 -> 选 0 -> 选 2 -> 解锁 3 -> 选 3 -> 解锁 1 -> 选 1
        // 期望：[4, 5, 0, 2, 3, 1]
        std::vector<std::pair<int, int>> dag1 = {
            {2, 3}, {3, 1}, {4, 0}, {4, 1}, {5, 0}, {5, 2}
        };
        labtest::expectEqVec("C1. DAG 多零入度点按编号升序输出唯一拓扑序",
                             {4, 5, 0, 2, 3, 1}, topoSort(6, dag1),
                             "检查 topoSort：必须使用小顶堆 priority_queue<int, vector<int>, greater<int>> 保证编号小的先出");

        // 用例 2：多连通分量 + 孤立点
        // 点 0..4，边：3->1, 4->2，孤立点 0
        // 初始入度 0：0, 3, 4 -> 选 0 -> 选 3（解锁 1）-> 选 1 -> 选 4（解锁 2）-> 选 2
        // 期望：[0, 3, 1, 4, 2]
        std::vector<std::pair<int, int>> dag2 = {{3, 1}, {4, 2}};
        labtest::expectEqVec("C2. 多连通分量与孤立点 DAG 拓扑序",
                             {0, 3, 1, 4, 2}, topoSort(5, dag2),
                             "检查 topoSort：所有入度为 0 的点都应入堆，解锁新节点后小顶堆会自动挑最小编号");

        // 用例 3：含环有向图（3->0->1->2->0）返回空
        std::vector<std::pair<int, int>> cyc1 = {
            {3, 0}, {0, 1}, {1, 2}, {2, 0}
        };
        labtest::expectEqVec("C3. 含有向环的图返回空数组 {}",
                             {}, topoSort(4, cyc1),
                             "检查 topoSort：循环结束后若 order.size() != n，必须返回空 vector {}");

        // 用例 4：含自环的图返回空
        std::vector<std::pair<int, int>> cyc2 = {{0, 1}, {1, 1}};
        labtest::expectEqVec("C4. 含自环 (1->1) 的图返回空数组 {}",
                             {}, topoSort(2, cyc2),
                             "检查 topoSort：自环会导致节点 1 入度永远 >= 1，最终无法排完 2 个点，应返回 {}");

        // 用例 5：单点与空图边界
        labtest::expectEqVec("C5. 单点无边返回 [0]", {0}, topoSort(1, {}),
                             "检查 topoSort 单点边界");
        labtest::expectEqVec("C6. 空图 (n=0) 返回 {}", {}, topoSort(0, {}),
                             "检查 topoSort 空图边界");
    }

    return labtest::endLab();
}
