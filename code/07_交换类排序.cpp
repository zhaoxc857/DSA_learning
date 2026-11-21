// ============================================================
// 07_交换类排序.cpp
// 配套笔记：第 7 章 排序 → 7.3.1 冒泡排序 / 7.3.2 快速排序
//
// 内容：冒泡排序（含优化）+ 快速排序（含分区过程详解）
//
// 编译运行：
//   g++ -std=c++11 07_交换类排序.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <chrono>
#include <functional>
using namespace std;

void printArray(const vector<int>& a, const string& prefix = "") {
    cout << prefix << "[";
    for (size_t i = 0; i < a.size(); i++) {
        cout << setw(3) << a[i];
        if (i + 1 < a.size()) cout << ",";
    }
    cout << " ]" << endl;
}

// ============================================================
// 一、冒泡排序
// ============================================================
void bubbleSortVerbose(vector<int> a) {
    int n = a.size();
    int totalCompare = 0, totalSwap = 0;

    cout << "  初始: ";
    printArray(a);
    cout << endl;

    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        int compares = 0, swaps = 0;

        for (int j = 0; j < n - 1 - i; j++) {
            compares++;
            if (a[j] > a[j + 1]) {
                swap(a[j], a[j + 1]);
                swaps++;
                swapped = true;
            }
        }
        totalCompare += compares;
        totalSwap += swaps;

        cout << "  第 " << i + 1 << " 趟：比较 " << compares << " 次，交换 "
             << swaps << " 次 → ";
        printArray(a, "  ");
        cout << "             └─ 第 " << n - 1 - i << " 个位置已确定（"
             << a[n - 1 - i] << "）" << endl;

        if (!swapped) {
            cout << "    ★ 本趟无交换，说明已经有序，提前结束！" << endl;
            break;
        }
    }

    cout << endl;
    cout << "  总比较 = " << totalCompare << "，总交换 = " << totalSwap << endl;
    cout << "  最终: ";
    printArray(a);
}

// ============================================================
// 二、快速排序（详细版）
// ============================================================

// 分区（带过程输出）
int partitionVerbose(vector<int>& a, int low, int high, int& depth) {
    int pivot = a[low];
    string indent(depth * 2, ' ');

    cout << indent << "  分区 [ " << low << " .. " << high << " ]，基准 = "
         << pivot << "（a[" << low << "]）" << endl;

    int startLow = low, startHigh = high;

    while (low < high) {
        // 从右往左找小于 pivot 的
        while (low < high && a[high] >= pivot) high--;
        if (low < high) {
            cout << indent << "    右→左找到 " << a[high] << " < " << pivot
                 << "，放到位置 " << low << endl;
            a[low] = a[high];
        }

        // 从左往右找大于 pivot 的
        while (low < high && a[low] <= pivot) low++;
        if (low < high) {
            cout << indent << "    左→右找到 " << a[low] << " > " << pivot
                 << "，放到位置 " << high << endl;
            a[high] = a[low];
        }
    }

    a[low] = pivot;
    cout << indent << "    基准归位到 " << low << " → ";
    cout << "[";
    for (int i = startLow; i <= startHigh; i++) {
        cout << a[i];
        if (i < startHigh) cout << ",";
    }
    cout << "]" << endl;

    return low;
}

void quickSortVerbose(vector<int>& a, int low, int high, int& depth) {
    if (low >= high) return;

    string indent(depth * 2, ' ');
    cout << indent << "・快速排序 [ " << low << " .. " << high << " ]" << endl;

    int pos = partitionVerbose(a, low, high, depth);

    depth++;
    if (low < pos - 1) quickSortVerbose(a, low, pos - 1, depth);
    if (pos + 1 < high) quickSortVerbose(a, pos + 1, high, depth);
    depth--;
}

// ---------- 简版（用于性能测试） ----------
int partition(vector<int>& a, int low, int high) {
    int pivot = a[low];
    while (low < high) {
        while (low < high && a[high] >= pivot) high--;
        a[low] = a[high];
        while (low < high && a[low] <= pivot) low++;
        a[high] = a[low];
    }
    a[low] = pivot;
    return low;
}

void quickSort(vector<int>& a, int low, int high) {
    if (low >= high) return;
    int pos = partition(a, low, high);
    quickSort(a, low, pos - 1);
    quickSort(a, pos + 1, high);
}

void bubbleSortSimple(vector<int> a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++)
            if (a[j] > a[j+1]) { swap(a[j], a[j+1]); swapped = true; }
        if (!swapped) break;
    }
}

void quickSortSimpleWrapper(vector<int> a) {
    quickSort(a, 0, a.size() - 1);
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  交换类排序：冒泡 + 快速" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 冒泡排序 ----------
    cout << "【1. 冒泡排序（带过程）】" << endl;
    cout << "----------------------------------------" << endl;
    vector<int> a1 = {49, 38, 65, 97, 76, 13, 27};
    bubbleSortVerbose(a1);
    cout << endl;

    // ---------- 2. 冒泡的优化效果 ----------
    cout << "【2. 冒泡排序的优化效果（swapped 标志）】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  对【已经有序】的数组排序：" << endl;
    vector<int> sorted = {1, 2, 3, 4, 5, 6, 7};
    bubbleSortVerbose(sorted);
    cout << "  → 第 1 趟就发现没有交换，立即结束，只比较 n-1 次" << endl;
    cout << "  → 这就是【最好情况 O(n)】的来源！" << endl << endl;

    cout << "  如果【去掉 swapped 标志】呢？" << endl;
    cout << "    第1趟: 比较 6 次，无交换" << endl;
    cout << "    第2趟: 比较 5 次，无交换" << endl;
    cout << "    第3趟: 比较 4 次" << endl;
    cout << "    ..." << endl;
    cout << "    总计 = 6+5+4+3+2+1 = 21 次 → O(n^2)" << endl;
    cout << "  → 所以 swapped 标志很关键！" << endl << endl;

    // ---------- 3. 快速排序 ----------
    cout << "【3. 快速排序（详细过程）】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  思想：选基准 → 分区（小的左边，大的右边）→ 递归" << endl << endl;

    vector<int> a2 = {49, 38, 65, 97, 76, 13, 27};
    cout << "  初始: ";
    printArray(a2);
    cout << endl;

    int depth = 0;
    quickSortVerbose(a2, 0, a2.size() - 1, depth);

    cout << endl << "  最终: ";
    printArray(a2);
    cout << endl;

    // ---------- 4. 快排的性能 vs 数据分布 ----------
    cout << "【4. 快速排序的性能与数据分布】" << endl;
    cout << "----------------------------------------" << endl;

    auto timeIt = [](void (*func)(vector<int>), vector<int> a) {
        auto t0 = chrono::high_resolution_clock::now();
        func(std::move(a));
        auto t1 = chrono::high_resolution_clock::now();
        return chrono::duration_cast<chrono::duration<double, milli>>(t1 - t0).count();
    };

    cout << "  【随机数据】快排（正常情况，O(n log n)）：" << endl;
    for (int n : {10000, 20000, 40000, 80000}) {
        vector<int> data(n);
        for (int i = 0; i < n; i++) data[i] = (i * 7919) % n;   // 伪随机
        double ms = timeIt(+quickSortSimpleWrapper, data);
        cout << "    n = " << setw(6) << n << "，耗时 " << setw(8)
             << setprecision(2) << ms << " ms" << endl;
    }
    cout << "    → n 翻倍，耗时约 ×2  →  O(n log n)" << endl << endl;

    cout << "  【已排序数据】快排（退化情况，O(n^2)）：" << endl;
    for (int n : {1000, 2000, 4000, 8000}) {
        vector<int> data(n);
        for (int i = 0; i < n; i++) data[i] = i;   // 递增有序
        double ms = timeIt(+quickSortSimpleWrapper, data);
        cout << "    n = " << setw(6) << n << "，耗时 " << setw(8)
             << setprecision(2) << ms << " ms" << endl;
    }
    cout << "    → n 翻倍，耗时约 ×4  →  O(n^2) 退化！" << endl << endl;

    cout << "  【为什么退化？】" << endl;
    cout << "    基准取 a[low] = 最小值" << endl;
    cout << "    分区结果: [] 和 [n-1 个元素]  → 极度不平衡" << endl;
    cout << "    递归深度 = n（而不是 log n）" << endl << endl;

    // ---------- 5. 改进方法 ----------
    cout << "【5. 改进：随机化基准】" << endl;
    cout << "----------------------------------------" << endl;

    // 随机化版本的快排
    auto quickSortRandom = [](vector<int> a) {
        function<void(int,int)> qs = [&](int low, int high) {
            if (low >= high) return;
            // ★ 随机选基准，和 low 交换
            int r = low + rand() % (high - low + 1);
            swap(a[low], a[r]);

            int pivot = a[low];
            int i = low, j = high;
            while (i < j) {
                while (i < j && a[j] >= pivot) j--;
                a[i] = a[j];
                while (i < j && a[i] <= pivot) i++;
                a[j] = a[i];
            }
            a[i] = pivot;
            qs(low, i - 1);
            qs(i + 1, high);
        };
        qs(0, a.size() - 1);
    };

    cout << "  对【已排序】数据用随机化快排：" << endl;
    srand(42);
    for (int n : {1000, 2000, 4000, 8000}) {
        vector<int> data(n);
        for (int i = 0; i < n; i++) data[i] = i;
        auto t0 = chrono::high_resolution_clock::now();
        quickSortRandom(data);
        auto t1 = chrono::high_resolution_clock::now();
        double ms = chrono::duration_cast<chrono::duration<double, milli>>(t1 - t0).count();
        cout << "    n = " << setw(6) << n << "，耗时 " << setw(8)
             << setprecision(2) << ms << " ms" << endl;
    }
    cout << "    → n 翻倍，耗时约 ×2  →  回到 O(n log n)！" << endl;
    cout << "    → 随机化基准成功避免了退化" << endl << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 冒泡 O(n^2)，最好 O(n)（靠 swapped 标志）" << endl;
    cout << "  2. 冒泡稳定（用 > 比较，相等不交换）" << endl;
    cout << "  3. 快排平均 O(n log n)，最坏 O(n^2)" << endl;
    cout << "  4. 快排不稳定（远距离交换）" << endl;
    cout << "  5. 避免退化的方法：随机基准 / 三数取中" << endl;
    cout << "========================================" << endl;

    return 0;
}
