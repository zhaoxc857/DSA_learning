// ============================================================
// 03_稀疏矩阵.cpp
// 配套笔记：第 3 章 线性表的扩展 → 3.5 多维数组 / 稀疏矩阵
//
// 内容：三元组表示法 + 快速转置
//
// 编译运行：
//   g++ -std=c++11 03_稀疏矩阵.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <iomanip>
#include <vector>
using namespace std;

// ---------- 三元组 ----------
struct Triple {
    int row;      // 行号
    int col;      // 列号
    int value;    // 值
};

// ============================================================
// 稀疏矩阵类（三元组顺序表）
// ============================================================
class SparseMatrix {
private:
    vector<Triple> data;   // 三元组数组（按行优先有序）
    int rows, cols;        // 矩阵维度

public:
    SparseMatrix(int r, int c) : rows(r), cols(c) {}

    // 从二维数组构建
    void buildFrom(int** mat) {
        data.clear();
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (mat[i][j] != 0) {
                    data.push_back({i, j, mat[i][j]});
                }
            }
        }
    }

    int nonZeroCount() const { return data.size(); }

    // ---------- 打印三元组 ----------
    void printTriples(const string& title = "三元组") const {
        cout << "  " << title << "（行 列 值）：" << endl;
        for (const auto& t : data) {
            cout << "    " << t.row << "  " << t.col << "  " << t.value << endl;
        }
    }

    // ---------- 还原成普通矩阵打印 ----------
    void printMatrix(const string& title = "矩阵") const {
        cout << "  " << title << "：" << endl;

        // 先建一个全 0 的二维数组
        vector<vector<int>> m(rows, vector<int>(cols, 0));
        for (const auto& t : data) {
            m[t.row][t.col] = t.value;
        }

        for (int i = 0; i < rows; i++) {
            cout << "    ";
            for (int j = 0; j < cols; j++) {
                cout << setw(4) << m[i][j];
            }
            cout << endl;
        }
    }

    // ---------- 普通转置：先交换行列，再排序 ----------
    SparseMatrix transposeSimple() const {
        SparseMatrix result(cols, rows);

        // 交换行列号
        for (const auto& t : data) {
            result.data.push_back({t.col, t.row, t.value});
        }

        // 按新行号（原列号）排序 —— 冒泡排序演示
        int n = result.data.size();
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - 1 - i; j++) {
                if (result.data[j].row > result.data[j + 1].row ||
                    (result.data[j].row == result.data[j + 1].row &&
                     result.data[j].col > result.data[j + 1].col)) {
                    swap(result.data[j], result.data[j + 1]);
                }
            }
        }
        return result;
    }

    // ---------- 快速转置：O(列数 + 非零元素个数) ----------
    SparseMatrix transposeFast() const {
        SparseMatrix result(cols, rows);
        result.data.resize(data.size());

        // ① 统计原矩阵每一列有多少个非零元素
        vector<int> colCount(cols, 0);
        for (const auto& t : data) {
            colCount[t.col]++;
        }

        // ② 计算每一列在结果三元组中的起始位置
        vector<int> startPos(cols, 0);
        for (int c = 1; c < cols; c++) {
            startPos[c] = startPos[c - 1] + colCount[c - 1];
        }

        // ③ 一次遍历，把每个元素直接放到正确位置
        vector<int> pos = startPos;   // 当前每列要填的位置
        for (const auto& t : data) {
            int p = pos[t.col]++;
            result.data[p] = {t.col, t.row, t.value};
        }

        return result;
    }

    // 判断两个稀疏矩阵是否相同（用于验证转置正确性）
    bool sameAs(const SparseMatrix& o) const {
        if (rows != o.rows || cols != o.cols) return false;
        if (data.size() != o.data.size()) return false;
        for (size_t i = 0; i < data.size(); i++) {
            if (data[i].row != o.data[i].row ||
                data[i].col != o.data[i].col ||
                data[i].value != o.data[i].value) return false;
        }
        return true;
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  稀疏矩阵 三元组表示法 + 转置" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 构建稀疏矩阵 ----------
    cout << "【1. 一个 5x5 的稀疏矩阵】" << endl;
    int raw[5][5] = {
        {0, 0, 0, 5, 0},
        {0, 0, 0, 0, 0},
        {0, 0, 3, 0, 0},
        {0, 0, 0, 0, 7},
        {1, 0, 0, 0, 0}
    };

    // 转成指针数组传给 SparseMatrix
    int* p[5];
    for (int i = 0; i < 5; i++) p[i] = raw[i];

    SparseMatrix sm(5, 5);
    sm.buildFrom(p);

    sm.printMatrix("原矩阵");
    cout << endl;
    sm.printTriples("原矩阵的三元组");
    cout << "  非零元素个数 = " << sm.nonZeroCount() << " / 25"
         << "（占比 " << (sm.nonZeroCount() * 100 / 25) << "%）" << endl;
    cout << endl;

    // ---------- 2. 普通转置 ----------
    cout << "【2. 普通转置（交换行列 + 排序）】" << endl;
    SparseMatrix t1 = sm.transposeSimple();
    t1.printMatrix("转置结果");
    cout << endl;

    // ---------- 3. 快速转置 ----------
    cout << "【3. 快速转置（一次遍历，不排序）】" << endl;
    SparseMatrix t2 = sm.transposeFast();
    t2.printMatrix("转置结果");
    cout << endl;

    t2.printTriples("转置后的三元组");
    cout << endl;

    // ---------- 4. 验证两种转置结果一致 ----------
    cout << "【4. 正确性验证】" << endl;
    cout << "  普通转置 vs 快速转置 结果"
         << (t1.sameAs(t2) ? "一致 ✓" : "不一致 ✗") << endl;
    cout << endl;

    // ---------- 5. 空间对比 ----------
    cout << "【5. 空间对比】" << endl;
    int dense = 5 * 5 * sizeof(int);
    int sparse = sm.nonZeroCount() * sizeof(Triple);
    cout << "  用二维数组存: " << dense << " 字节（25 个 int）" << endl;
    cout << "  用三元组存:   " << sparse << " 字节（"
         << sm.nonZeroCount() << " 个三元组，每个 "
         << sizeof(Triple) << " 字节）" << endl;
    cout << "  → 元素越稀疏，三元组省得越多" << endl;
    cout << endl;

    // ---------- 6. 更大规模演示 ----------
    cout << "【6. 大规模稀疏矩阵的空间优势】" << endl;
    for (int n : {100, 1000, 10000}) {
        long long denseBytes = (long long)n * n * 4;          // int 占 4 字节
        long long sparseBytes = (long long)n * 4 * sizeof(Triple);  // 每行 4 个非零
        cout << "  " << n << "x" << n << " 矩阵（每行 4 个非零）:" << endl;
        cout << "    二维数组: " << denseBytes / 1024 << " KB" << endl;
        cout << "    三元组:   " << sparseBytes / 1024 << " KB" << endl;
        cout << "    省了 " << (denseBytes / (sparseBytes ? sparseBytes : 1)) << " 倍" << endl;
    }
    cout << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  三元组只存非零元素：(行, 列, 值)" << endl;
    cout << "  普通转置：O(非零个数 * log) —— 要排序" << endl;
    cout << "  快速转置：O(列数 + 非零个数) —— 不排序" << endl;
    cout << "========================================" << endl;

    return 0;
}
