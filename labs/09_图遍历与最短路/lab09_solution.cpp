// ============================================================================
// 第 09 关【参考答案】：图遍历与最短路（邻接表 DFS/BFS + 邻接矩阵 Prim + Dijkstra）
// 对应笔记：《05-图.md》5.2 ~ 5.5
// ============================================================================

#include <iostream>
#include <queue>
#include <vector>
#include "../common/test_kit.h"

const int INF = 1000000000;

struct Edge {
    int to;      // 邻接顶点编号（0 .. n-1）
    int weight;  // 边权（无权图默认填 1）
};

struct Graph {
    int n;                               // 顶点总数，顶点编号为 0 .. n-1
    std::vector<std::vector<Edge>> adj;  // 邻接表：adj[u] 存从 u 出发的所有边
};

// -------------------- 辅助建图函数 --------------------

Graph makeGraph(int n) {
    Graph g;
    g.n = n;
    g.adj.assign(n, std::vector<Edge>());
    return g;
}

void addDirectedEdge(Graph& g, int u, int v, int w = 1) {
    Edge e;
    e.to = v;
    e.weight = w;
    g.adj[u].push_back(e);
}

void addUndirectedEdge(Graph& g, int u, int v, int w = 1) {
    addDirectedEdge(g, u, v, w);
    addDirectedEdge(g, v, u, w);
}

// ============================== 参考实现 ==============================

std::vector<int> bfsAll(const Graph& g) {
    std::vector<int> result;
    if (g.n <= 0) {
        return result;
    }

    std::vector<bool> visited(g.n, false);
    std::queue<int> q;

    // 外层循环：确保访问所有连通分量与孤立点
    for (int start = 0; start < g.n; ++start) {
        if (visited[start]) {
            continue;
        }
        visited[start] = true;
        q.push(start);

        while (!q.empty()) {
            int u = q.front();
            q.pop();
            result.push_back(u);

            for (size_t i = 0; i < g.adj[u].size(); ++i) {
                int v = g.adj[u][i].to;
                if (!visited[v]) {
                    visited[v] = true;  // 入队瞬间标记，避免重复入队
                    q.push(v);
                }
            }
        }
    }
    return result;
}

void dfsFrom(const Graph& g, int u, std::vector<bool>& visited, std::vector<int>& result) {
    visited[u] = true;
    result.push_back(u);

    for (size_t i = 0; i < g.adj[u].size(); ++i) {
        int v = g.adj[u][i].to;
        if (!visited[v]) {
            dfsFrom(g, v, visited, result);
        }
    }
}

std::vector<int> dfsAll(const Graph& g) {
    std::vector<int> result;
    if (g.n <= 0) {
        return result;
    }

    std::vector<bool> visited(g.n, false);
    for (int start = 0; start < g.n; ++start) {
        if (!visited[start]) {
            dfsFrom(g, start, visited, result);
        }
    }
    return result;
}

int primMST(int n, const std::vector<std::vector<int>>& mat) {
    if (n <= 0) {
        return 0;
    }

    std::vector<bool> inMST(n, false);
    std::vector<int> lowCost(n, INF);
    lowCost[0] = 0;
    int totalWeight = 0;

    for (int step = 0; step < n; ++step) {
        int u = -1;
        int best = INF;
        for (int v = 0; v < n; ++v) {
            if (!inMST[v] && lowCost[v] < best) {
                best = lowCost[v];
                u = v;
            }
        }
        // 还有未入树的顶点，但没有任何边连向当前生成树 -> 图不连通
        if (u == -1) {
            return -1;
        }

        inMST[u] = true;
        totalWeight += best;

        // 用刚加入树集合的 u 去刷新剩余未入树顶点的最小割边权
        for (int v = 0; v < n; ++v) {
            if (!inMST[v] && mat[u][v] < lowCost[v]) {
                lowCost[v] = mat[u][v];
            }
        }
    }

    return totalWeight;
}

std::vector<int> dijkstra(const Graph& g, int src) {
    if (g.n <= 0) {
        return std::vector<int>();
    }

    std::vector<int> dist(g.n, INF);
    if (src < 0 || src >= g.n) {
        return dist;
    }

    std::vector<bool> visited(g.n, false);
    dist[src] = 0;

    for (int step = 0; step < g.n; ++step) {
        int u = -1;
        int best = INF;
        for (int i = 0; i < g.n; ++i) {
            if (!visited[i] && dist[i] < best) {
                best = dist[i];
                u = i;
            }
        }
        // 剩余未访问顶点均不可达，直接结束（也避免了 INF + w 溢出）
        if (u == -1) {
            break;
        }

        visited[u] = true;

        for (size_t i = 0; i < g.adj[u].size(); ++i) {
            int v = g.adj[u][i].to;
            int w = g.adj[u][i].weight;
            if (!visited[v] && dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    return dist;
}

// ============================== 自动评测代码 ==============================
// 注意：请不要修改 main() 中的测试逻辑！

int main() {
    labtest::beginLab("Lab 09: 图遍历与最短路 (BFS/DFS + Prim + Dijkstra)");

    // ---------------- 1. 边界：空图与单顶点图 ----------------
    {
        Graph emptyG = makeGraph(0);
        labtest::expectEqVec(
            "空图 bfsAll",
            std::vector<int>(),
            bfsAll(emptyG),
            "当 g.n == 0 时应直接返回空 vector，不要越界访问 visited[0]");
        labtest::expectEqVec(
            "空图 dfsAll",
            std::vector<int>(),
            dfsAll(emptyG),
            "当 g.n == 0 时应直接返回空 vector");
        labtest::expectEqInt(
            "空图 primMST",
            0,
            primMST(0, std::vector<std::vector<int>>()),
            "题目约定 n == 0 时 primMST 返回 0");
        labtest::expectEqVec(
            "空图 dijkstra",
            std::vector<int>(),
            dijkstra(emptyG, 0),
            "当 g.n == 0 时 dijkstra 应直接返回空 vector");

        Graph singleG = makeGraph(1);
        std::vector<int> singleMatRow(1, 0);
        std::vector<std::vector<int>> singleMat(1, singleMatRow);
        labtest::expectEqVec(
            "单顶点图 bfsAll",
            std::vector<int>{0},
            bfsAll(singleG),
            "只有一个顶点 0 时，BFS 结果应为 [0]");
        labtest::expectEqVec(
            "单顶点图 dfsAll",
            std::vector<int>{0},
            dfsAll(singleG),
            "只有一个顶点 0 时，DFS 结果应为 [0]");
        labtest::expectEqInt(
            "单顶点图 primMST",
            0,
            primMST(1, singleMat),
            "单个顶点需要 0 条边即可构成生成树，总权值为 0");
        labtest::expectEqVec(
            "单顶点图 dijkstra",
            std::vector<int>{0},
            dijkstra(singleG, 0),
            "源点 0 到自身最短距离应为 0");
    }

    // ---------------- 2. 连通带环图的 BFS 与 DFS ----------------
    /*
     * 图结构（各邻接表严格按邻居编号升序加边）：
     *      0
     *     / \
     *    1   2
     *   / \   \
     *  3   4---5
     */
    {
        Graph g = makeGraph(6);
        addUndirectedEdge(g, 0, 1);
        addUndirectedEdge(g, 0, 2);
        addUndirectedEdge(g, 1, 3);
        addUndirectedEdge(g, 1, 4);
        addUndirectedEdge(g, 2, 5);
        addUndirectedEdge(g, 4, 5);

        labtest::expectEqVec(
            "连通带环图 bfsAll 顺序验证",
            std::vector<int>{0, 1, 2, 3, 4, 5},
            bfsAll(g),
            "检查 BFS 是否按层入队，且在【入队时】立即标记 visited，避免 5 被重复入队");

        labtest::expectEqVec(
            "连通带环图 dfsAll 顺序验证",
            std::vector<int>{0, 1, 3, 4, 5, 2},
            dfsAll(g),
            "检查 DFS 是否沿第一条未访问邻边一条路走到底：0->1->3 回溯 1->4->5->2");
    }

    // ---------------- 3. 非连通图（含孤立点 + 多个连通分量） ----------------
    // 分量 1: 0 - 2
    // 分量 2: 1（孤立点）
    // 分量 3: 3 - 4 - 6，3 - 5
    {
        Graph g = makeGraph(7);
        addUndirectedEdge(g, 0, 2);
        addUndirectedEdge(g, 3, 4);
        addUndirectedEdge(g, 3, 5);
        addUndirectedEdge(g, 4, 6);

        labtest::expectEqVec(
            "非连通图（含孤立点）bfsAll 全覆盖",
            std::vector<int>{0, 2, 1, 3, 4, 5, 6},
            bfsAll(g),
            "BFS 外层必须循环 start = 0..g.n-1，否则孤立点 1 和分量 {3,4,5,6} 会漏掉");

        labtest::expectEqVec(
            "非连通图（含孤立点）dfsAll 全覆盖",
            std::vector<int>{0, 2, 1, 3, 4, 6, 5},
            dfsAll(g),
            "DFS 外层必须循环 start = 0..g.n-1；并在分量 {3,4,5,6} 中先深搜 3->4->6 再访问 5");
    }

    // ---------------- 4. Prim 最小生成树 ----------------
    {
        // 4.1 经典 5 顶点带权无向图
        int n = 5;
        std::vector<std::vector<int>> mat(n, std::vector<int>(n, INF));
        for (int i = 0; i < n; ++i) mat[i][i] = 0;
        auto setEdge = [&](int u, int v, int w) {
            mat[u][v] = w;
            mat[v][u] = w;
        };
        setEdge(0, 1, 2);
        setEdge(0, 3, 6);
        setEdge(1, 2, 3);
        setEdge(1, 3, 8);
        setEdge(1, 4, 5);
        setEdge(2, 4, 7);
        setEdge(3, 4, 9);

        labtest::expectEqInt(
            "Prim 经典 5 顶点连通图 MST 总权值",
            16,
            primMST(n, mat),
            "MST 选边应为 (0,1)=2, (1,2)=3, (1,4)=5, (0,3)=6，总权值=16；检查 lowCost 更新逻辑");

        // 4.2 检验“后加入顶点带来更短割边”的 4 顶点图
        int n2 = 4;
        std::vector<std::vector<int>> mat2(n2, std::vector<int>(n2, INF));
        for (int i = 0; i < n2; ++i) mat2[i][i] = 0;
        auto setEdge2 = [&](int u, int v, int w) {
            mat2[u][v] = w;
            mat2[v][u] = w;
        };
        setEdge2(0, 1, 10);
        setEdge2(0, 2, 1);
        setEdge2(2, 1, 2);
        setEdge2(1, 3, 3);
        setEdge2(2, 3, 9);

        labtest::expectEqInt(
            "Prim 动态更新 lowCost（非直连最优）",
            6,
            primMST(n2, mat2),
            "选 2 后应将 lowCost[1] 从 10 更新为 2，选 1 后将 lowCost[3] 从 9 更新为 3，总权值=1+2+3=6");

        // 4.3 非连通图应返回 -1
        int n3 = 4;
        std::vector<std::vector<int>> mat3(n3, std::vector<int>(n3, INF));
        for (int i = 0; i < n3; ++i) mat3[i][i] = 0;
        mat3[0][1] = mat3[1][0] = 4;
        mat3[2][3] = mat3[3][2] = 5;

        labtest::expectEqInt(
            "Prim 非连通图返回 -1",
            -1,
            primMST(n3, mat3),
            "当某轮找不到 lowCost < INF 的未入树顶点时，图不连通，必须返回 -1");
    }

    // ---------------- 5. Dijkstra 单源最短路 ----------------
    {
        // 5.1 多路径松弛 + 不可达顶点
        Graph g = makeGraph(6);
        addDirectedEdge(g, 0, 1, 10);
        addDirectedEdge(g, 0, 2, 3);
        addDirectedEdge(g, 2, 1, 4);  // 0->2->1 = 7 < 10
        addDirectedEdge(g, 2, 3, 8);  // 0->2->3 = 11
        addDirectedEdge(g, 2, 4, 2);  // 0->2->4 = 5
        addDirectedEdge(g, 1, 3, 2);  // 0->2->1->3 = 9
        addDirectedEdge(g, 4, 3, 3);  // 0->2->4->3 = 8（最短！）
        addDirectedEdge(g, 5, 0, 1);  // 顶点 5 只有出边没有入边，从 0 不可达

        labtest::expectEqVec(
            "Dijkstra 多路径松弛与不可达顶点",
            std::vector<int>{0, 7, 3, 8, 5, INF},
            dijkstra(g, 0),
            "检查松弛公式 dist[u] + w < dist[v]，以及不可达顶点 5 应保持 INF 且不可引发溢出");

        // 5.2 自环 + 平行边 + 零权边
        Graph g2 = makeGraph(4);
        addDirectedEdge(g2, 0, 0, 5);   // 自环
        addDirectedEdge(g2, 1, 1, 0);   // 零权自环
        addDirectedEdge(g2, 0, 1, 9);   // 平行边 1
        addDirectedEdge(g2, 0, 1, 2);   // 平行边 2（更短）
        addDirectedEdge(g2, 0, 1, 6);   // 平行边 3
        addDirectedEdge(g2, 1, 2, 0);   // 零权边
        addDirectedEdge(g2, 2, 3, 4);
        addDirectedEdge(g2, 0, 3, 10);

        labtest::expectEqVec(
            "Dijkstra 自环、平行边与零权边处理",
            std::vector<int>{0, 2, 2, 6},
            dijkstra(g2, 0),
            "平行边 0->1 应自动松弛出最小权值 2，自环不应干扰结果，最终 0->1->2->3 距离为 6");
    }

    return labtest::endLab();
}
