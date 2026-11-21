// ============================================================
// 07_选择与堆排序.cpp
// 配套笔记：第 7 章 排序 → 7.3.3 堆排序（附简单选择排序）
//
// 内容：简单选择排序 + 堆排序（含建堆和调整过程详解）
//
// 编译运行：
//   g++ -std=c++11 07_选择与堆排序.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
using namespace std;

void printArray(const vector<int>& a, const string& prefix = "") {
    cout << prefix << "[";
    for (size_t i = 0; i < a.size(); i++) {
        cout << setw(3) << a[i];
        if (i + 1 < a.size()) cout << ",";
    }
    cout << " ]" << endl;
}

// ---------- 打印"堆"的形状（数组 → 树） ----------
void printHeapShape(const vector<int>& a, int n) {
    if (n <= 0) return;

    // 计算层数
    int levels = 0, cnt = 1;
    while (cnt < n) { cnt *= 2; levels++; }

    cout << "    堆（树形）:" << endl;
    int idx = 0;
    for (int lv = 0; lv <= levels && idx < n; lv++) {
        int count = 1 << lv;           // 该层最多 2^lv 个
        int indent = (1 << (levels - lv)) - 1;
        cout << "      " << string(indent * 2, ' ');
        for (int k = 0; k < count && idx < n; k++) {
            cout << setw(3) << a[idx++];
            cout << string(indent * 4 + 2, ' ');
        }
        cout << endl;
    }
}

// ============================================================
// 一、简单选择排序
// ============================================================
void selectionSortVerbose(vector<int> a) {
    int n = a.size();
    int totalCompare = 0, totalSwap = 0;

    cout << "  初始: ";
    printArray(a);
    cout << endl;

    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            totalCompare++;
            if (a[j] < a[minIdx]) minIdx = j;
        }

        cout << "  第 " << i + 1 << " 趟：在 [";
        for (int k = i; k < n; k++) cout << a[k] << (k < n - 1 ? "," : "");
        cout << "] 中找最小值 = " << a[minIdx];

        if (minIdx != i) {
            swap(a[i], a[minIdx]);
            totalSwap++;
            cout << "，与 a[" << i << "] 交换";
        } else {
            cout << "（已在正确位置）";
        }
        cout << endl << "    → ";
        printArray(a, "  ");
    }

    cout << endl;
    cout << "  总比较 = " << totalCompare << "（固定 n(n-1)/2），总交换 = "
         << totalSwap << endl;
    cout << "  最终: ";
    printArray(a);
}

// ============================================================
// 二、堆排序
// ============================================================

// 向下调整（带过程输出）
void siftDownVerbose(vector<int>& a, int n, int i, const string& tag = "") {
    cout << "    调整节点 a[" << i << "] = " << a[i] << tag << endl;

    while (true) {
        int largest = i;
        int l = 2 * i + 1, r = 2 * i + 2;

        if (l < n && a[l] > a[largest]) largest = l;
        if (r < n && a[r] > a[largest]) largest = r;

        if (largest == i) {
            cout << "      → 已满足堆性质，停止" << endl;
            break;
        }

        cout << "      → " << a[i] << " < " << a[largest]
             << "（孩子），交换" << endl;
        swap(a[i], a[largest]);
        i = largest;
    }
}

// 堆排序（带过程输出）
void heapSortVerbose(vector<int> a) {
    int n = a.size();

    cout << "  初始: ";
    printArray(a);
    printHeapShape(a, n);
    cout << endl;

    // ---------- 阶段1：建堆 ----------
    cout << "  【阶段1】建堆（从最后一个非叶节点开始，逐个向下调整）" << endl;
    cout << "    最后一个非叶节点的下标 = " << n << "/2 - 1 = " << n/2 - 1 << endl << endl;

    for (int i = n / 2 - 1; i >= 0; i--) {
        siftDownVerbose(a, n, i);
    }

    cout << endl << "  建堆完成: ";
    printArray(a);
    printHeapShape(a, n);
    cout << "  → 堆顶 a[0] = " << a[0] << " 是最大值 ✓" << endl << endl;

    // ---------- 阶段2：排序 ----------
    cout << "  【阶段2】依次取堆顶（最大值）放到末尾" << endl << endl;

    for (int i = n - 1; i > 0; i--) {
        cout << "  第 " << n - i << " 次：交换 a[0]=" << a[0]
             << " 和 a[" << i << "]=" << a[i] << endl;

        swap(a[0], a[i]);
        cout << "    交换后: ";
        printArray(a, "    ");
        cout << "    → a[" << i << "] = " << a[i] << " 已就位" << endl;

        siftDownVerbose(a, i, 0, "(重建堆)");
        cout << "    重建后: ";
        printArray(a, "    ");
        cout << endl;
    }

    cout << "  最终: ";
    printArray(a);
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  选择类排序：简单选择 + 堆排序" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 简单选择排序 ----------
    cout << "【1. 简单选择排序】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  思路：每趟从未排序区选出最小值，放到已排序区末尾" << endl << endl;

    vector<int> a1 = {49, 38, 65, 97, 76, 13, 27};
    selectionSortVerbose(a1);
    cout << endl;
    cout << "  特点：比较次数固定是 n(n-1)/2，与数据无关" << endl;
    cout << "        但交换次数很少（最多 n-1 次）" << endl;
    cout << "  → 适合【元素移动代价大】的场景" << endl;
    cout << endl;

    // ---------- 2. 堆排序 ----------
    cout << "【2. 堆排序】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  核心：完全二叉树用数组存储" << endl;
    cout << "        下标 i 的: 左孩子 2i+1, 右孩子 2i+2, 父节点 (i-1)/2" << endl << endl;

    vector<int> a2 = {49, 38, 65, 97, 76, 13, 27};
    heapSortVerbose(a2);
    cout << endl;

    // ---------- 3. 堆的性质验证 ----------
    cout << "【3. 验证堆的性质】" << endl;
    cout << "----------------------------------------" << endl;

    // 建一个大顶堆，然后验证
    vector<int> test = {3, 1, 6, 5, 2, 4};
    cout << "  原始: ";
    printArray(test);

    int n = test.size();
    for (int i = n/2 - 1; i >= 0; i--) {
        // 简单版 siftDown
        int idx = i;
        while (true) {
            int largest = idx;
            int l = 2*idx+1, r = 2*idx+2;
            if (l < n && test[l] > test[largest]) largest = l;
            if (r < n && test[r] > test[largest]) largest = r;
            if (largest == idx) break;
            swap(test[idx], test[largest]);
            idx = largest;
        }
    }
    cout << "  建堆后: ";
    printArray(test);
    printHeapShape(test, n);

    // 验证
    bool valid = true;
    for (int i = 0; i < n; i++) {
        int l = 2*i+1, r = 2*i+2;
        if (l < n && test[i] < test[l]) { valid = false; break; }
        if (r < n && test[i] < test[r]) { valid = false; break; }
    }
    cout << "  → " << (valid ? "满足大顶堆性质 ✓（每个父节点 >= 孩子）"
                            : "不满足 ✗") << endl;
    cout << endl;

    // ---------- 4. 建堆的复杂度 ----------
    cout << "【4. 建堆为什么是 O(n) 而不是 O(n log n)？】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  直觉上：n 个节点，每个调整 O(log n) → O(n log n)" << endl;
    cout << "  但实际上更多地节点在【下层】，调整深度【浅】" << endl << endl;
    cout << "  精确计算：" << endl;
    cout << "    第 h 层有 n/2^(h+1) 个节点，每个调整代价 O(h)" << endl;
    cout << "    总代价 = Σ (n/2^(h+1)) × h ≈ n × Σ(h/2^h) = n × 2 = O(n)" << endl;
    cout << endl;

    // ---------- 5. 堆排序的特点 ----------
    cout << "【5. 堆排序的特点】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  ✓ 时间: 最好/平均/最坏 都是 O(n log n)" << endl;
    cout << "  ✓ 空间: O(1)（原地排序）" << endl;
    cout << "  ✗ 不稳定（调整时跳跃交换）" << endl;
    cout << "  ✗ 缓存不友好（跳跃访问）" << endl;
    cout << endl;

    // ---------- 6. 为什么堆排序不稳定？演示 ----------
    cout << "【6. 为什么堆排序不稳定？（演示）】" << endl;
    cout << "----------------------------------------" << endl;

    // 用 pair 演示
    vector<pair<int,int>> st = {{2,0}, {1,1}, {2,2}};
    cout << "  测试数据: ";
    for (auto& p : st) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    // 建堆（大顶堆）
    vector<pair<int,int>> h = st;
    int m = h.size();
    for (int i = m/2-1; i >= 0; i--) {
        int idx = i;
        while (true) {
            int lg = idx, l = 2*idx+1, r = 2*idx+2;
            if (l < m && h[l].first > h[lg].first) lg = l;
            if (r < m && h[r].first > h[lg].first) lg = r;
            if (lg == idx) break;
            swap(h[idx], h[lg]);
            idx = lg;
        }
    }
    cout << "  建堆后: ";
    for (auto& p : h) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    // 排序
    for (int i = m-1; i > 0; i--) {
        swap(h[0], h[i]);
        int sz = i, idx = 0;
        while (true) {
            int lg = idx, l = 2*idx+1, r = 2*idx+2;
            if (l < sz && h[l].first > h[lg].first) lg = l;
            if (r < sz && h[r].first > h[lg].first) lg = r;
            if (lg == idx) break;
            swap(h[idx], h[lg]);
            idx = lg;
        }
    }
    cout << "  排序后: ";
    for (auto& p : h) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    // 检查稳定性
    bool stable = true;
    for (int i = 0; i + 1 < m; i++) {
        if (h[i].first == h[i+1].first && h[i].second > h[i+1].second) {
            stable = false;
            break;
        }
    }
    cout << "  → " << (stable ? "本例恰好稳定" : "两个 2 的顺序反了 → 不稳定 ✗") << endl;
    cout << "    （堆排序理论上不稳定，因为调整是跳跃式的）" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 简单选择：O(n^2)，比较固定，交换少，不稳定" << endl;
    cout << "  2. 堆排序：O(n log n)（最坏也是！），O(1) 空间" << endl;
    cout << "  3. 堆用数组存：孩子 2i+1/2i+2，父 (i-1)/2" << endl;
    cout << "  4. 建堆 O(n)，排序 O(n log n)" << endl;
    cout << "  5. 堆排序不稳定" << endl;
    cout << "========================================" << endl;

    return 0;
}
