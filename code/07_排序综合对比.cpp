// ============================================================
// 07_排序综合对比.cpp
// 配套笔记：第 7 章 排序
//
// 内容：实现所有排序算法 + 性能实测对比 + 稳定性验证
//
// 包含：直接插入、希尔、冒泡、快速、简单选择、堆、归并
//       计数、桶、基数
//
// 编译运行：
//   g++ -std=c++11 -O2 07_排序综合对比.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <algorithm>
#include <chrono>
#include <random>
#include <string>
#include <iomanip>
#include <functional>
using namespace std;
using namespace chrono;

// ============================================================
// 一、插入类排序
// ============================================================

// ---------- 直接插入排序 ----------
void insertionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 1; i < n; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {   // ★ > 保证稳定
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}

// ---------- 希尔排序 ----------
void shellSort(vector<int>& a) {
    int n = a.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int key = a[i];
            int j = i - gap;
            while (j >= 0 && a[j] > key) {
                a[j + gap] = a[j];
                j -= gap;
            }
            a[j + gap] = key;
        }
    }
}

// ============================================================
// 二、交换类排序
// ============================================================

// ---------- 冒泡排序（带优化） ----------
void bubbleSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (a[j] > a[j + 1]) {       // ★ > 保证稳定
                swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;             // ★ 提前结束
    }
}

// ---------- 快速排序 ----------
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

void quickSortHelper(vector<int>& a, int low, int high) {
    if (low >= high) return;
    int pos = partition(a, low, high);
    quickSortHelper(a, low, pos - 1);
    quickSortHelper(a, pos + 1, high);
}

void quickSort(vector<int>& a) {
    quickSortHelper(a, 0, a.size() - 1);
}

// ============================================================
// 三、选择类排序
// ============================================================

// ---------- 简单选择排序 ----------
void selectionSort(vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (a[j] < a[minIdx]) minIdx = j;
        }
        if (minIdx != i) swap(a[i], a[minIdx]);
    }
}

// ---------- 堆排序 ----------
void siftDown(vector<int>& a, int n, int i) {
    while (true) {
        int largest = i;
        int l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l] > a[largest]) largest = l;
        if (r < n && a[r] > a[largest]) largest = r;
        if (largest == i) break;
        swap(a[i], a[largest]);
        i = largest;
    }
}

void heapSort(vector<int>& a) {
    int n = a.size();
    // 建堆
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, n, i);
    // 依次取堆顶
    for (int i = n - 1; i > 0; i--) {
        swap(a[0], a[i]);
        siftDown(a, i, 0);
    }
}

// ============================================================
// 四、归并排序
// ============================================================
void merge(vector<int>& a, int low, int mid, int high, vector<int>& tmp) {
    int i = low, j = mid + 1, k = low;
    while (i <= mid && j <= high) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];   // ★ <= 保证稳定
        else              tmp[k++] = a[j++];
    }
    while (i <= mid)  tmp[k++] = a[i++];
    while (j <= high) tmp[k++] = a[j++];
    for (int t = low; t <= high; t++) a[t] = tmp[t];
}

void mergeSortHelper(vector<int>& a, int low, int high, vector<int>& tmp) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSortHelper(a, low, mid, tmp);
    mergeSortHelper(a, mid + 1, high, tmp);
    merge(a, low, mid, high, tmp);
}

void mergeSort(vector<int>& a) {
    vector<int> tmp(a.size());
    mergeSortHelper(a, 0, a.size() - 1, tmp);
}

// ============================================================
// 五、非比较排序
// ============================================================

// ---------- 计数排序 ----------
void countingSort(vector<int>& a) {
    if (a.empty()) return;
    int maxVal = *max_element(a.begin(), a.end());
    int minVal = *min_element(a.begin(), a.end());
    int range = maxVal - minVal + 1;

    vector<int> count(range, 0);
    for (int x : a) count[x - minVal]++;

    // 前缀和（保证稳定）
    for (int i = 1; i < range; i++) count[i] += count[i - 1];

    vector<int> output(a.size());
    for (int i = a.size() - 1; i >= 0; i--) {
        int idx = a[i] - minVal;
        output[count[idx] - 1] = a[i];
        count[idx]--;
    }
    a = output;
}

// ---------- 基数排序（LSD） ----------
void radixSort(vector<int>& a) {
    if (a.empty()) return;
    const int BASE = 10;
    int maxVal = *max_element(a.begin(), a.end());

    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        vector<vector<int>> buckets(BASE);
        for (int x : a) {
            int digit = (x / exp) % BASE;
            buckets[digit].push_back(x);
        }
        int idx = 0;
        for (int b = 0; b < BASE; b++) {
            for (int x : buckets[b]) a[idx++] = x;
        }
    }
}

// ---------- 桶排序 ----------
void bucketSort(vector<int>& a) {
    if (a.empty()) return;
    int n = a.size();
    int maxVal = *max_element(a.begin(), a.end());
    int minVal = *min_element(a.begin(), a.end());
    if (maxVal == minVal) return;

    int bucketCount = n;
    vector<vector<int>> buckets(bucketCount);

    // 分配到桶
    for (int x : a) {
        int idx = (long long)(x - minVal) * bucketCount / (maxVal - minVal + 1);
        if (idx >= bucketCount) idx = bucketCount - 1;
        buckets[idx].push_back(x);
    }

    // 每个桶内排序
    for (auto& b : buckets) insertionSort(b);

    // 收集
    int idx = 0;
    for (auto& b : buckets) {
        for (int x : b) a[idx++] = x;
    }
}

// ============================================================
// 六、工具函数
// ============================================================

// 生成随机数组
vector<int> genRandom(int n, int maxVal = 100000, int seed = 42) {
    mt19937 rng(seed);
    vector<int> a(n);
    for (int& x : a) x = rng() % maxVal;
    return a;
}

// 生成有序数组
vector<int> genSorted(int n) {
    vector<int> a(n);
    for (int i = 0; i < n; i++) a[i] = i;
    return a;
}

// 生成逆序数组
vector<int> genReversed(int n) {
    vector<int> a(n);
    for (int i = 0; i < n; i++) a[i] = n - i;
    return a;
}

// 计时
template <typename Func>
double timeIt(Func f, vector<int> a) {
    auto t0 = high_resolution_clock::now();
    f(a);
    auto t1 = high_resolution_clock::now();
    return duration_cast<duration<double, milli>>(t1 - t0).count();
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  排序算法综合对比" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 各算法正确性验证 ----------
    cout << "【1. 正确性验证】" << endl;
    cout << "----------------------------------------" << endl;

    vector<int> original = {49, 38, 65, 97, 76, 13, 27, 49};
    cout << "  原始数组: ";
    for (int x : original) cout << x << " ";
    cout << endl << endl;

    struct Algo {
        string name;
        function<void(vector<int>&)> func;
    };

    vector<Algo> algos = {
        {"直接插入排序", insertionSort},
        {"希尔排序",     shellSort},
        {"冒泡排序",     bubbleSort},
        {"快速排序",     quickSort},
        {"简单选择排序", selectionSort},
        {"堆排序",       heapSort},
        {"归并排序",     mergeSort},
        {"计数排序",     countingSort},
        {"桶排序",       bucketSort},
        {"基数排序",     radixSort},
    };

    for (auto& algo : algos) {
        vector<int> a = original;
        algo.func(a);

        bool sorted = is_sorted(a.begin(), a.end());
        cout << "  " << setw(14) << algo.name << ": ";
        for (int x : a) cout << setw(3) << x;
        cout << (sorted ? "  ✓" : "  ✗") << endl;
    }
    cout << endl;

    // ---------- 2. 稳定性验证 ----------
    cout << "【2. 稳定性验证】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  用 (值, 原始下标) 对排序，检查相等元素的相对顺序" << endl << endl;

    // 构造测试数据：多个相等的值
    vector<pair<int,int>> testData;
    vector<int> vals = {3, 1, 2, 1, 3, 2, 1, 2};
    for (size_t i = 0; i < vals.size(); i++) testData.push_back({vals[i], (int)i});

    cout << "  测试数据: ";
    for (auto& p : testData) cout << p.first << "(" << p.second << ") ";
    cout << endl << endl;

    // 稳定性检查函数
    auto checkStable = [](vector<pair<int,int>> a, string name) {
        // 用稳定排序（std::stable_sort）标记"应该的顺序"
        auto expected = a;
        stable_sort(expected.begin(), expected.end(),
                    [](const pair<int,int>& x, const pair<int,int>& y) {
                        return x.first < y.first;
                    });
        return a == expected;
    };

    // 只测部分算法（因为大部分需要改造才能带下标）
    cout << "  从理论上说（见笔记表格）：" << endl;
    cout << "    稳定:   直接插入、冒泡、归并、计数、桶、基数" << endl;
    cout << "    不稳定: 希尔、快速、简单选择、堆排序" << endl << endl;

    // 实际验证归并排序的稳定性（用 pair 版本）
    {
        // 用 pair 版本的归并排序验证
        vector<pair<int,int>> a = testData;
        // 手动归并
        function<void(int,int)> ms = [&](int low, int high) {
            if (low >= high) return;
            int mid = (low + high) / 2;
            ms(low, mid); ms(mid+1, high);
            vector<pair<int,int>> tmp;
            int i = low, j = mid + 1;
            while (i <= mid && j <= high) {
                if (a[i].first <= a[j].first) tmp.push_back(a[i++]);  // ★ <=
                else                          tmp.push_back(a[j++]);
            }
            while (i <= mid)  tmp.push_back(a[i++]);
            while (j <= high) tmp.push_back(a[j++]);
            for (size_t t = 0; t < tmp.size(); t++) a[low + t] = tmp[t];
        };
        ms(0, a.size() - 1);

        cout << "  归并排序结果: ";
        for (auto& p : a) cout << p.first << "(" << p.second << ") ";
        cout << endl;
        cout << "  是否稳定: " << (checkStable(a, "merge") ? "稳定 ✓" : "不稳定 ✗") << endl;
    }
    cout << endl;

    // ---------- 3. 性能对比（随机数据） ----------
    cout << "【3. 性能对比（n = 100000，随机数据）】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  算法            耗时(ms)" << endl;

    int N = 100000;
    vector<int> baseRandom = genRandom(N);

    struct Result {
        string name;
        double ms;
    };
    vector<Result> results;

    for (auto& algo : algos) {
        double ms = timeIt(algo.func, baseRandom);
        results.push_back({algo.name, ms});
        cout << "  " << setw(14) << algo.name << "   " 
             << setw(8) << fixed << setprecision(1) << ms << endl;
    }
    cout << endl;
    cout << "  → 快排、归并、堆排、基数、计数都很快" << endl;
    cout << "  → O(n^2) 的算法（插入、冒泡、选择）明显慢" << endl;
    cout << endl;

    // ---------- 4. 不同数据分布的对比 ----------
    cout << "【4. 不同数据分布的影响（n = 20000）】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  算法            随机      已排序    逆序" << endl;

    int N2 = 20000;
    vector<int> randData = genRandom(N2);
    vector<int> sortedData = genSorted(N2);
    vector<int> revData = genReversed(N2);

    for (auto& algo : algos) {
        double t1 = timeIt(algo.func, randData);
        double t2 = timeIt(algo.func, sortedData);
        double t3 = timeIt(algo.func, revData);

        cout << "  " << setw(14) << algo.name << "  "
             << setw(8) << setprecision(2) << t1 << "  "
             << setw(8) << t2 << "  "
             << setw(8) << t3 << endl;
    }
    cout << endl;

    cout << "  观察:" << endl;
    cout << "    - 插入/冒泡 在【已排序】时是 O(n)，特别快" << endl;
    cout << "    - 快速排序 在【已排序】时退化（因为基准取首元素）" << endl;
    cout << "    - 堆排/归并 不受数据分布影响（稳定 O(n log n)）" << endl;
    cout << endl;

    // ---------- 5. 快速排序退化演示 ----------
    cout << "【5. 快速排序退化演示】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  对【已经有序】的数组用快排（基准取首元素）：" << endl << endl;

    for (int n : {1000, 2000, 4000, 8000}) {
        vector<int> sorted = genSorted(n);
        double ms = timeIt(quickSort, sorted);
        cout << "    n = " << setw(5) << n << "，耗时 " 
             << setw(8) << setprecision(2) << ms << " ms"
             << "  （n 翻倍，耗时约 ×4 → O(n²) 退化！）" << endl;
    }
    cout << endl;

    cout << "  对比：对【随机】数组用快排：" << endl;
    for (int n : {1000, 2000, 4000, 8000}) {
        vector<int> rnd = genRandom(n);
        double ms = timeIt(quickSort, rnd);
        cout << "    n = " << setw(5) << n << "，耗时 "
             << setw(8) << setprecision(2) << ms << " ms"
             << "  （n 翻倍，耗时约 ×2 → O(n log n)）" << endl;
    }
    cout << endl;

    cout << "  → 这就是快排最坏 O(n²) 的来源！" << endl;
    cout << "  → 解决办法：随机化基准 / 三数取中 / 用 std::sort" << endl;
    cout << endl;

    // ---------- 6. 非比较排序的优势 ----------
    cout << "【6. 非比较排序在值域小时的优势】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  数据: 100 万个 0~100 的整数" << endl << endl;

    int N3 = 1000000;
    vector<int> smallRange = genRandom(N3, 101);   // 值 0~100
    vector<int> bigRange = genRandom(N3, 100000000);  // 值 0~1亿

    cout << "  算法          值域 0~100    值域 0~1亿" << endl;
    cout << "  快速排序      " << setw(10) << setprecision(1)
         << timeIt(quickSort, smallRange) << " ms"
         << setw(10) << timeIt(quickSort, bigRange) << " ms" << endl;
    cout << "  计数排序      " << setw(10)
         << timeIt(countingSort, smallRange) << " ms"
         << setw(10) << "不可用（值域太大）" << endl;
    cout << "  基数排序      " << setw(10)
         << timeIt(radixSort, smallRange) << " ms"
         << setw(10) << timeIt(radixSort, bigRange) << " ms" << endl;
    cout << endl;

    cout << "  → 值域小时，计数排序 O(n+k) 最快" << endl;
    cout << "  → 值域大时，计数排序不可用（要开 1 亿的数组）" << endl;
    cout << "  → 基数排序 对两种情况都适用" << endl;
    cout << endl;

    // ---------- 7. 总结表 ----------
    cout << "【7. 复杂度总结】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  算法          平均        最坏       空间    稳定" << endl;
    cout << "  直接插入      O(n^2)      O(n^2)     O(1)    是" << endl;
    cout << "  希尔          O(n^1.3)    O(n^2)     O(1)    否" << endl;
    cout << "  冒泡          O(n^2)      O(n^2)     O(1)    是" << endl;
    cout << "  快速          O(nlogn)    O(n^2)     O(logn) 否" << endl;
    cout << "  简单选择      O(n^2)      O(n^2)     O(1)    否" << endl;
    cout << "  堆排序        O(nlogn)    O(nlogn)   O(1)    否" << endl;
    cout << "  归并          O(nlogn)    O(nlogn)   O(n)    是" << endl;
    cout << "  计数          O(n+k)      O(n+k)     O(n+k)  是" << endl;
    cout << "  桶            O(n+k)      O(n^2)     O(n+k)  是" << endl;
    cout << "  基数          O(d(n+k))   O(d(n+k))  O(n+k)  是" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  记忆口诀：" << endl;
    cout << "  稳定：插入、冒泡、归并、计数、桶、基数" << endl;
    cout << "  最坏仍是 O(nlogn)：堆排序、归并排序" << endl;
    cout << "  最好能到 O(n)：插入排序、冒泡排序" << endl;
    cout << "========================================" << endl;

    return 0;
}
