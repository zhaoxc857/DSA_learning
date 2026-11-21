// ============================================================
// 07_插入与希尔排序.cpp
// 配套笔记：第 7 章 排序 → 7.2 插入类排序
//
// 内容：直接插入排序（逐趟过程）+ 希尔排序（逐趟分组过程）
//
// 编译运行：
//   g++ -std=c++11 07_插入与希尔排序.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <chrono>
using namespace std;

// ---------- 打印数组 ----------
void printArray(const vector<int>& a, const string& prefix = "") {
    cout << prefix << "[";
    for (size_t i = 0; i < a.size(); i++) {
        cout << setw(3) << a[i];
        if (i + 1 < a.size()) cout << ",";
    }
    cout << " ]" << endl;
}

// ---------- 打印带分隔（显示已排序区） ----------
void printPartition(const vector<int>& a, int sortedEnd) {
    cout << "  [";
    for (size_t i = 0; i < a.size(); i++) {
        cout << setw(3) << a[i];
        if (i + 1 < a.size()) cout << ",";
    }
    cout << " ]  ";
    cout << "  已排序区: 0~" << sortedEnd;
    cout << endl;
}

// ============================================================
// 一、直接插入排序（带过程输出）
// ============================================================
int insertionSortVerbose(vector<int> a) {
    int n = a.size();
    int totalCompare = 0, totalMove = 0;

    cout << "  初始: ";
    printArray(a);
    cout << endl;

    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        int compares = 0, moves = 0;

        cout << "  第 " << i << " 趟：插入 a[" << i << "] = " << key << endl;

        while (j >= 0 && a[j] > key) {
            compares++;
            a[j + 1] = a[j];
            moves++;
            j--;
        }
        if (j >= 0) compares++;   // 最后那次"失败"的比较也要算

        a[j + 1] = key;
        totalCompare += compares;
        totalMove += moves;

        cout << "    比较 " << compares << " 次，移动 " << moves << " 次 → ";
        printArray(a, "  ");
    }

    cout << endl;
    cout << "  总比较次数 = " << totalCompare
         << "，总移动次数 = " << totalMove << endl;
    cout << "  最终: ";
    printArray(a);
    return totalCompare;
}

// ============================================================
// 二、希尔排序（带过程输出）
// ============================================================
void shellSortVerbose(vector<int> a) {
    int n = a.size();

    cout << "  初始: ";
    printArray(a);
    cout << endl;

    int pass = 0;
    for (int gap = n / 2; gap > 0; gap /= 2) {
        pass++;
        cout << "  ---- 第 " << pass << " 趟：gap = " << gap << " ----" << endl;

        // 显示分组
        cout << "    分组：";
        for (int start = 0; start < gap && start < n; start++) {
            cout << "组" << start << "={";
            bool first = true;
            for (int i = start; i < n; i += gap) {
                if (!first) cout << ",";
                cout << a[i];
                first = false;
            }
            cout << "} ";
        }
        cout << endl;

        // 组内插入排序
        for (int i = gap; i < n; i++) {
            int key = a[i];
            int j = i - gap;
            while (j >= 0 && a[j] > key) {
                a[j + gap] = a[j];
                j -= gap;
            }
            a[j + gap] = key;
        }

        cout << "    本趟结果: ";
        printArray(a, "  ");
    }

    cout << endl;
    cout << "  最终: ";
    printArray(a);
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  插入类排序" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 直接插入排序 ----------
    cout << "【1. 直接插入排序】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  思路：像理扑克牌，每张新牌插到已排好的牌里" << endl;
    cout << "        把 a[i] 插入到 a[0..i-1] 这个已排序区间" << endl << endl;

    vector<int> a1 = {49, 38, 65, 97, 76, 13, 27};
    insertionSortVerbose(a1);
    cout << endl;

    // ---------- 2. 最好/最坏情况 ----------
    cout << "【2. 最好 vs 最坏情况】" << endl;
    cout << "----------------------------------------" << endl;

    cout << "  最好（已经有序）:" << endl;
    vector<int> best = {1, 2, 3, 4, 5, 6, 7};
    insertionSortVerbose(best);
    cout << "  → 每趟只比较 1 次，总比较 n-1 次 → O(n)" << endl << endl;

    cout << "  最坏（完全逆序）:" << endl;
    vector<int> worst = {7, 6, 5, 4, 3, 2, 1};
    insertionSortVerbose(worst);
    cout << "  → 每趟都要比较到最前面 → O(n^2)" << endl << endl;

    // ---------- 3. 稳定性演示 ----------
    cout << "【3. 稳定性：直接插入排序是稳定的】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  关键：while 条件是 a[j] > key（严格大于）" << endl;
    cout << "        遇到相等元素就停下，不会越过它" << endl << endl;

    // 用 pair 验证
    vector<pair<int,int>> st = {{2,0},{1,1},{2,2},{1,3}};
    cout << "  测试数据（值, 原始下标）: ";
    for (auto& p : st) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    // 手动插入排序
    int n = st.size();
    for (int i = 1; i < n; i++) {
        auto key = st[i];
        int j = i - 1;
        while (j >= 0 && st[j].first > key.first) {
            st[j + 1] = st[j];
            j--;
        }
        st[j + 1] = key;
    }
    cout << "  排序后: ";
    for (auto& p : st) cout << p.first << "(" << p.second << ") ";
    cout << endl;
    if (st[0].second < st[1].second) {
        cout << "  → 两个 2 的原始下标分别是 " << st[0].second
             << " 和 " << st[1].second << "，仍是递增的 ✓" << endl;
    } else {
        cout << "  → 顺序被打乱 ✗" << endl;
    }
    cout << "    （值相等的元素相对顺序没变，所以稳定）" << endl << endl;

    // ---------- 4. 希尔排序 ----------
    cout << "【4. 希尔排序】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  思路：先用大间隔让元素大步跳，快速接近最终位置" << endl;
    cout << "        再逐步缩小间隔，最后 gap=1 做普通插入排序" << endl << endl;

    vector<int> a2 = {49, 38, 65, 97, 76, 13, 27, 49};
    shellSortVerbose(a2);
    cout << endl;

    // ---------- 5. 希尔 vs 插入 的性能对比 ----------
    cout << "【5. 希尔排序 vs 插入排序（性能对比）】" << endl;
    cout << "----------------------------------------" << endl;

    // 计时函数（模板，兼容 C++11）
    auto timeIt = [](void (*func)(vector<int>), vector<int> a) {
        auto t0 = chrono::high_resolution_clock::now();
        func(a);
        auto t1 = chrono::high_resolution_clock::now();
        return chrono::duration_cast<chrono::duration<double, milli>>(t1 - t0).count();
    };

    // 把 lambda 转成函数指针
    static auto insertionFn = [](vector<int> a) {
        int n = a.size();
        for (int i = 1; i < n; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }
            a[j+1] = key;
        }
    };
    static auto shellFn = [](vector<int> a) {
        int n = a.size();
        for (int gap = n/2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int key = a[i];
                int j = i - gap;
                while (j >= 0 && a[j] > key) { a[j+gap] = a[j]; j -= gap; }
                a[j+gap] = key;
            }
        }
    };

    cout << "      n      插入排序(ms)    希尔排序(ms)    加速比" << endl;
    for (int sz : {1000, 5000, 20000}) {
        vector<int> data(sz);
        // 制造逆序数据（插入排序的最坏情况）
        for (int i = 0; i < sz; i++) data[i] = sz - i;

        double t1 = timeIt(+insertionFn, data);
        double t2 = timeIt(+shellFn, data);

        cout << "  " << setw(6) << sz << "     " << setw(10) << setprecision(2) << t1
             << "     " << setw(10) << t2
             << "     " << setw(6) << (int)(t1 / (t2 > 0.001 ? t2 : 0.001)) << "x" << endl;
    }
    cout << endl;
    cout << "  → 希尔排序比插入排序快很多（尤其是大数据量）" << endl;
    cout << "  → 因为它让元素 [大步跳]，减少了总的移动次数" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 直接插入：O(n^2)，最好 O(n)，稳定，空间 O(1)" << endl;
    cout << "  2. 希尔排序：O(n^1.3)~O(n^2)，不稳定，空间 O(1)" << endl;
    cout << "  3. 稳定性来自 a[j] > key（严格大于）" << endl;
    cout << "  4. 希尔 = 插入排序 + gap 分组" << endl;
    cout << "========================================" << endl;

    return 0;
}
