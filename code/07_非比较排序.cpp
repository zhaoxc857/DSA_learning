// ============================================================
// 07_非比较排序.cpp
// 配套笔记：第 7 章 排序 → 7.4 非比较的排序算法
//
// 内容：计数排序 + 桶排序 + 基数排序（都带过程演示）
//       + 与比较排序的性能对比
//
// 编译运行：
//   g++ -std=c++11 07_非比较排序.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>
#include <chrono>
using namespace std;

void printArray(const vector<int>& a, const string& prefix = "") {
    cout << prefix << "[";
    for (size_t i = 0; i < a.size(); i++) {
        cout << setw(4) << a[i];
        if (i + 1 < a.size()) cout << ",";
    }
    cout << " ]" << endl;
}

// ============================================================
// 一、计数排序（带过程）
// ============================================================
void countingSortVerbose(vector<int> a) {
    if (a.empty()) return;

    int maxVal = *max_element(a.begin(), a.end());
    int minVal = *min_element(a.begin(), a.end());
    int range = maxVal - minVal + 1;

    cout << "  原始数组: ";
    printArray(a);
    cout << "  值域范围: [" << minVal << ", " << maxVal
         << "]，共 " << range << " 种取值" << endl << endl;

    // ① 统计次数
    vector<int> count(range, 0);
    for (int x : a) count[x - minVal]++;

    cout << "  第1步：统计每个值出现的次数" << endl;
    cout << "    值  : ";
    for (int v = minVal; v <= maxVal; v++) cout << setw(4) << v;
    cout << endl << "    次数: ";
    for (int c : count) cout << setw(4) << c;
    cout << endl << endl;

    // ② 前缀和
    for (int i = 1; i < range; i++) count[i] += count[i - 1];

    cout << "  第2步：计算前缀和（每个值的 [结束位置]）" << endl;
    cout << "    值  : ";
    for (int v = minVal; v <= maxVal; v++) cout << setw(4) << v;
    cout << endl << "    前缀: ";
    for (int c : count) cout << setw(4) << c;
    cout << endl << endl;

    // ③ 从后往前填充（保证稳定）
    vector<int> output(a.size());
    vector<int> cnt2(count);   // 拷贝一份用于输出

    cout << "  第3步：从后往前扫描原数组，按前缀和放到正确位置" << endl;
    for (int i = a.size() - 1; i >= 0; i--) {
        int idx = a[i] - minVal;
        cnt2[idx]--;
        output[cnt2[idx]] = a[i];
        cout << "    处理 a[" << i << "]=" << a[i]
             << " → 放到位置 " << cnt2[idx] << endl;
    }
    cout << endl;

    cout << "  结果: ";
    printArray(output);
}

// ============================================================
// 二、桶排序（带过程）
// ============================================================
void bucketSortVerbose(vector<int> a) {
    if (a.empty()) return;

    int n = a.size();
    int maxVal = *max_element(a.begin(), a.end());
    int minVal = *min_element(a.begin(), a.end());

    cout << "  原始数组: ";
    printArray(a);
    cout << "  值域: [" << minVal << ", " << maxVal << "]" << endl;
    cout << "  桶数 = n = " << n << endl << endl;

    vector<vector<int>> buckets(n);

    // 分配
    cout << "  第1步：把每个元素分配到对应的桶" << endl;
    for (int x : a) {
        int idx = (long long)(x - minVal) * n / (maxVal - minVal + 1);
        if (idx >= n) idx = n - 1;
        buckets[idx].push_back(x);
    }

    for (int i = 0; i < n; i++) {
        if (!buckets[i].empty()) {
            cout << "    桶" << setw(2) << i << " → ";
            printArray(buckets[i], "");
        }
    }
    cout << endl;

    // 桶内排序
    cout << "  第2步：每个桶内部排序（用插入排序）" << endl;
    for (int i = 0; i < n; i++) {
        if (buckets[i].size() > 1) {
            cout << "    桶" << setw(2) << i << " 排序前: ";
            printArray(buckets[i], "");
            sort(buckets[i].begin(), buckets[i].end());
            cout << "    桶" << setw(2) << i << " 排序后: ";
            printArray(buckets[i], "");
        }
    }
    cout << endl;

    // 收集
    cout << "  第3步：按桶的顺序收集" << endl;
    vector<int> result;
    for (int i = 0; i < n; i++) {
        for (int x : buckets[i]) result.push_back(x);
    }
    cout << "  结果: ";
    printArray(result);
}

// ============================================================
// 三、基数排序（带过程）
// ============================================================
void radixSortVerbose(vector<int> a) {
    if (a.empty()) return;
    const int BASE = 10;
    int maxVal = *max_element(a.begin(), a.end());

    cout << "  原始数组: ";
    printArray(a);
    cout << "  最大值 = " << maxVal << endl << endl;

    int pass = 0;
    for (int exp = 1; maxVal / exp > 0; exp *= 10) {
        pass++;
        string unit = (exp == 1) ? "个位" : (exp == 10) ? "十位" :
                      (exp == 100) ? "百位" : (exp == 1000) ? "千位" : "更高位";
        cout << "  ---- 第 " << pass << " 趟：按【" << unit << "】分配 ----" << endl;

        vector<vector<int>> buckets(BASE);
        for (int x : a) {
            int digit = (x / exp) % BASE;
            buckets[digit].push_back(x);
        }

        // 显示各桶
        for (int b = 0; b < BASE; b++) {
            if (!buckets[b].empty()) {
                cout << "    桶" << b << ": ";
                printArray(buckets[b], "");
            }
        }

        // 收集
        int idx = 0;
        for (int b = 0; b < BASE; b++) {
            for (int x : buckets[b]) a[idx++] = x;
        }
        cout << "    收集后: ";
        printArray(a, "    ");
        cout << endl;
    }

    cout << "  结果: ";
    printArray(a);
}

// ============================================================
// 计时辅助
// ============================================================
double timeIt(void (*func)(vector<int>), vector<int> a) {
    auto t0 = chrono::high_resolution_clock::now();
    func(std::move(a));
    auto t1 = chrono::high_resolution_clock::now();
    return chrono::duration_cast<chrono::duration<double, milli>>(t1 - t0).count();
}

void countingSortPlain(vector<int> a) {
    if (a.empty()) return;
    int mx = *max_element(a.begin(), a.end());
    int mn = *min_element(a.begin(), a.end());
    vector<int> cnt(mx - mn + 1, 0);
    for (int x : a) cnt[x - mn]++;
    int idx = 0;
    for (int i = 0; i < (int)cnt.size(); i++)
        for (int k = 0; k < cnt[i]; k++) a[idx++] = i + mn;
}

void radixSortPlain(vector<int> a) {
    if (a.empty()) return;
    int mx = *max_element(a.begin(), a.end());
    for (int exp = 1; mx / exp > 0; exp *= 10) {
        vector<vector<int>> buckets(10);
        for (int x : a) buckets[(x / exp) % 10].push_back(x);
        int idx = 0;
        for (auto& b : buckets) for (int x : b) a[idx++] = x;
    }
}

void stdSortPlain(vector<int> a) {
    sort(a.begin(), a.end());
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  非比较排序：计数 / 桶 / 基数" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 计数排序 ----------
    cout << "【1. 计数排序】" << endl;
    cout << "----------------------------------------" << endl;
    countingSortVerbose({4, 2, 2, 8, 3, 3, 1});
    cout << endl;

    // ---------- 2. 桶排序 ----------
    cout << "【2. 桶排序】" << endl;
    cout << "----------------------------------------" << endl;
    bucketSortVerbose({29, 25, 3, 49, 9, 37, 21, 43});
    cout << endl;

    // ---------- 3. 基数排序 ----------
    cout << "【3. 基数排序】" << endl;
    cout << "----------------------------------------" << endl;
    radixSortVerbose({170, 45, 75, 90, 802, 24, 2, 66});
    cout << endl;

    // ---------- 4. 性能对比 ----------
    cout << "【4. 性能对比：值域大小的影响】" << endl;
    cout << "----------------------------------------" << endl;

    int N = 1000000;
    vector<int> smallRange(N);   // 值 0~100
    vector<int> bigRange(N);     // 值 0~1亿
    for (int i = 0; i < N; i++) {
        // ★ 用 long long 计算，避免 int 溢出成负数
        long long r = ((long long)i * 7919) % 101;
        smallRange[i] = (int)r;
        long long r2 = ((long long)i * 7919) % 100000000;
        bigRange[i] = (int)r2;
    }

    cout << "  数据量 n = " << N << endl << endl;
    cout << "  算法          值域 0~100      值域 0~1亿" << endl;
    cout << fixed << setprecision(1);

    double t1 = timeIt(+stdSortPlain, smallRange);
    double t2 = timeIt(+stdSortPlain, bigRange);
    cout << "  std::sort     " << setw(10) << t1 << " ms"
         << setw(13) << t2 << " ms" << endl;

    t1 = timeIt(+countingSortPlain, smallRange);
    cout << "  计数排序      " << setw(10) << t1 << " ms"
         << setw(13) << "不可用*" << endl;

    t1 = timeIt(+radixSortPlain, smallRange);
    t2 = timeIt(+radixSortPlain, bigRange);
    cout << "  基数排序      " << setw(10) << t1 << " ms"
         << setw(13) << t2 << " ms" << endl;
    cout << defaultfloat;

    cout << endl;
    cout << "  * 计数排序对值域 0~1亿的数据，需要开 1 亿的计数数组" << endl;
    cout << "    （约 400MB），内存和时间都不可接受" << endl;
    cout << endl;
    cout << "  → 值域小时，计数排序最快（O(n)）" << endl;
    cout << "  → 值域大时，计数器太多，改用基数排序" << endl;
    cout << endl;

    // ---------- 5. 稳定性验证 ----------
    cout << "【5. 稳定性验证】" << endl;
    cout << "----------------------------------------" << endl;

    // 计数排序的稳定性
    vector<pair<int,int>> st = {{3,0}, {1,1}, {3,2}, {1,3}, {2,4}};
    cout << "  测试数据: ";
    for (auto& p : st) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    int mx = 3, mn = 1;
    vector<int> cnt(mx - mn + 1, 0);
    for (auto& p : st) cnt[p.first - mn]++;
    for (int i = 1; i < (int)cnt.size(); i++) cnt[i] += cnt[i-1];

    vector<pair<int,int>> out(st.size());
    for (int i = st.size() - 1; i >= 0; i--) {   // ★ 从后往前
        int idx = st[i].first - mn;
        out[--cnt[idx]] = st[i];
    }

    cout << "  计数排序后: ";
    for (auto& p : out) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    bool stable = true;
    for (size_t k = 0; k + 1 < out.size(); k++)
        if (out[k].first == out[k+1].first && out[k].second > out[k+1].second)
            stable = false;
    cout << "  → " << (stable ? "稳定 ✓（从后往前填充保证了稳定性）"
                            : "不稳定 ✗") << endl;
    cout << endl;

    // ---------- 6. 为什么能突破 O(n log n) ----------
    cout << "【6. 为什么非比较排序能突破 O(n log n)？】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  基于比较的排序下界：Ω(n log n)" << endl;
    cout << "    推导：n 个元素有 n! 种排列" << endl;
    cout << "          每次比较只能得 1 位信息（是/否）" << endl;
    cout << "          至少需要 log2(n!) ≈ n log n 次比较" << endl;
    cout << endl;
    cout << "  非比较排序【不做比较】！" << endl;
    cout << "    计数排序：直接用值当数组下标" << endl;
    cout << "    基数排序：直接按位的数值分类" << endl;
    cout << "  → 不受 Ω(n log n) 约束" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 计数排序 O(n+k)，k 是值域大小，稳定" << endl;
    cout << "  2. 桶排序 O(n+k)，但最坏 O(n^2)，稳定" << endl;
    cout << "  3. 基数排序 O(d(n+k))，d 是位数，稳定" << endl;
    cout << "  4. 三者都【不做比较】，突破了 nlogn 下界" << endl;
    cout << "  5. 值域小用计数，值域大用基数" << endl;
    cout << "========================================" << endl;

    return 0;
}
