// ============================================================
// 07_归并排序.cpp
// 配套笔记：第 7 章 排序 → 7.3.4 归并排序
//
// 内容：归并排序（含"分"与"合"的完整过程）+ 稳定性验证
//       + 外部排序思想演示
//
// 编译运行：
//   g++ -std=c++11 07_归并排序.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <functional>
#include <climits>
using namespace std;

void printArray(const vector<int>& a, const string& prefix = "") {
    cout << prefix << "[";
    for (size_t i = 0; i < a.size(); i++) {
        cout << setw(3) << a[i];
        if (i + 1 < a.size()) cout << ",";
    }
    cout << " ]" << endl;
}

void printRange(const vector<int>& a, int low, int high, const string& prefix = "") {
    cout << prefix << "[";
    for (int i = low; i <= high; i++) {
        cout << setw(3) << a[i];
        if (i < high) cout << ",";
    }
    cout << " ]";
}

// ============================================================
// 归并排序（带完整过程输出）
// ============================================================

// 合并两个有序区间
void mergeVerbose(vector<int>& a, int low, int mid, int high,
                  vector<int>& tmp, int depth) {
    string indent(depth * 2, ' ');

    cout << indent << "  合并 ";
    printRange(a, low, mid);
    cout << " 和 ";
    printRange(a, mid + 1, high);
    cout << endl;

    int i = low, j = mid + 1, k = low;

    while (i <= mid && j <= high) {
        if (a[i] <= a[j]) {           // ★ <= 保证稳定
            tmp[k++] = a[i++];
        } else {
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid)  tmp[k++] = a[i++];
    while (j <= high) tmp[k++] = a[j++];

    for (int t = low; t <= high; t++) a[t] = tmp[t];

    cout << indent << "  → 结果 ";
    printRange(a, low, high);
    cout << endl;
}

void mergeSortVerbose(vector<int>& a, int low, int high,
                      vector<int>& tmp, int depth) {
    if (low >= high) return;

    string indent(depth * 2, ' ');
    int mid = low + (high - low) / 2;

    cout << indent << "【分】[ " << low << " .. " << high << " ] → [ "
         << low << " .. " << mid << " ] 和 [ " << mid + 1 << " .. " << high << " ]" << endl;

    mergeSortVerbose(a, low, mid, tmp, depth + 1);
    mergeSortVerbose(a, mid + 1, high, tmp, depth + 1);

    mergeVerbose(a, low, mid, high, tmp, depth);
}

// 简版（用于性能测试）
void mergeSimple(vector<int>& a, int low, int mid, int high, vector<int>& tmp) {
    int i = low, j = mid + 1, k = low;
    while (i <= mid && j <= high) {
        if (a[i] <= a[j]) tmp[k++] = a[i++];
        else              tmp[k++] = a[j++];
    }
    while (i <= mid)  tmp[k++] = a[i++];
    while (j <= high) tmp[k++] = a[j++];
    for (int t = low; t <= high; t++) a[t] = tmp[t];
}

void mergeSortSimple(vector<int>& a, int low, int high, vector<int>& tmp) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSortSimple(a, low, mid, tmp);
    mergeSortSimple(a, mid + 1, high, tmp);
    mergeSimple(a, low, mid, high, tmp);
}

// ============================================================
// 演示：外部排序思想（模拟分块 + 多路归并）
// ============================================================
void externalSortDemo() {
    cout << "  模拟：数据太大装不下内存，怎么办？" << endl;
    cout << "----------------------------------------" << endl << endl;

    // 假设内存只能装 5 个数，但总共有 20 个数
    vector<int> bigData = {49, 38, 65, 97, 76, 13, 27, 49, 55, 4,
                           88, 21, 33, 90, 12, 67, 45, 78, 2, 99};
    int chunkSize = 5;

    cout << "  总数据（20 个）: ";
    printArray(bigData);
    cout << "  内存只能装 " << chunkSize << " 个" << endl << endl;

    // 第1步：分块排序
    cout << "  【第1步】分块读入内存，块内排序，写回磁盘" << endl;
    vector<vector<int>> chunks;
    for (int i = 0; i < (int)bigData.size(); i += chunkSize) {
        vector<int> chunk;
        for (int j = i; j < i + chunkSize && j < (int)bigData.size(); j++) {
            chunk.push_back(bigData[j]);
        }
        vector<int> tmp(chunk.size());
        mergeSortSimple(chunk, 0, chunk.size() - 1, tmp);
        chunks.push_back(chunk);

        cout << "    块 " << chunks.size() << ": ";
        printArray(chunk, "      ");
    }
    cout << "  → 得到 " << chunks.size() << " 个有序块（存在磁盘上）" << endl << endl;

    // 第2步：多路归并
    cout << "  【第2步】多路归并（每次只把各块的最小值读进内存）" << endl;

    vector<int> result;
    vector<int> pos(chunks.size(), 0);   // 每个块的当前位置

    while (true) {
        int minVal = INT_MAX;
        int minChunk = -1;

        // 在 5 个块的"当前元素"中找最小的
        for (size_t c = 0; c < chunks.size(); c++) {
            if (pos[c] < (int)chunks[c].size() && chunks[c][pos[c]] < minVal) {
                minVal = chunks[c][pos[c]];
                minChunk = c;
            }
        }
        if (minChunk == -1) break;

        result.push_back(minVal);
        pos[minChunk]++;
    }

    cout << "  → 归并结果: ";
    printArray(result);
    cout << "  → 排序完成 ✓（全过程内存中最多只有 5+5 个元素）" << endl;
    cout << endl;
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  归并排序" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 归并排序完整过程 ----------
    cout << "【1. 归并排序的完整过程】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  思想：分（一分为二）→ 治（递归排序）→ 合（合并两个有序表）" << endl << endl;

    vector<int> a = {49, 38, 65, 97, 76, 13, 27};
    cout << "  初始: ";
    printArray(a);
    cout << endl;

    vector<int> tmp(a.size());
    mergeSortVerbose(a, 0, a.size() - 1, tmp, 0);

    cout << endl << "  最终: ";
    printArray(a);
    cout << endl;

    // ---------- 2. 合并过程详解 ----------
    cout << "【2. 合并两个有序数组的详解】" << endl;
    cout << "----------------------------------------" << endl;

    vector<int> left  = {13, 27, 38};
    vector<int> right = {49, 65, 76, 97};
    cout << "  左: ";
    printArray(left);
    cout << "  右: ";
    printArray(right);
    cout << endl;

    cout << "  比较过程（每次取两边排头较小的）:" << endl;
    int i = 0, j = 0;
    vector<int> merged;
    int step = 0;
    while (i < (int)left.size() && j < (int)right.size()) {
        step++;
        cout << "    第" << step << "次: " << left[i] << " vs " << right[j];
        if (left[i] <= right[j]) {
            cout << " → 取 " << left[i] << "（左）" << endl;
            merged.push_back(left[i++]);
        } else {
            cout << " → 取 " << right[j] << "（右）" << endl;
            merged.push_back(right[j++]);
        }
    }
    while (i < (int)left.size())  { merged.push_back(left[i++]); }
    while (j < (int)right.size()) { merged.push_back(right[j++]); }

    cout << "  合并结果: ";
    printArray(merged);
    cout << endl;

    // ---------- 3. 稳定性验证 ----------
    cout << "【3. 稳定性验证（关键：a[i] <= a[j]）】" << endl;
    cout << "----------------------------------------" << endl;

    vector<pair<int,int>> st = {{3,0}, {1,1}, {3,2}, {1,3}, {2,4}};
    cout << "  测试数据: ";
    for (auto& p : st) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    // 用 pair 版归并排序
    function<void(int,int)> ms = [&](int low, int high) {
        if (low >= high) return;
        int mid = (low + high) / 2;
        ms(low, mid);
        ms(mid + 1, high);

        vector<pair<int,int>> tmp2;
        int i2 = low, j2 = mid + 1;
        while (i2 <= mid && j2 <= high) {
            if (st[i2].first <= st[j2].first) tmp2.push_back(st[i2++]);  // ★ <=
            else                              tmp2.push_back(st[j2++]);
        }
        while (i2 <= mid)  tmp2.push_back(st[i2++]);
        while (j2 <= high) tmp2.push_back(st[j2++]);
        for (size_t t = 0; t < tmp2.size(); t++) st[low + t] = tmp2[t];
    };
    ms(0, st.size() - 1);

    cout << "  排序后: ";
    for (auto& p : st) cout << p.first << "(" << p.second << ") ";
    cout << endl;

    bool stable = true;
    for (size_t k = 0; k + 1 < st.size(); k++) {
        if (st[k].first == st[k+1].first && st[k].second > st[k+1].second) {
            stable = false; break;
        }
    }
    cout << "  → " << (stable ? "稳定 ✓（相等的元素保持原顺序）" : "不稳定 ✗") << endl;
    cout << "  关键：用了 a[i] <= a[j]，相等时优先取左边" << endl;
    cout << "        如果写成 a[i] < a[j]，就会变成不稳定！" << endl << endl;

    // ---------- 4. 复杂度分析 ----------
    cout << "【4. 复杂度分析】" << endl;
    cout << "----------------------------------------" << endl;

    for (int n : {1000, 10000, 100000, 1000000}) {
        // 计算递归层数
        int levels = 0, m = n;
        while (m > 1) { m /= 2; levels++; }

        cout << "  n = " << setw(8) << n
             << "，递归层数 = " << levels
             << "，总操作数 ≈ " << n << " × " << levels
             << " = " << (long long)n * levels << endl;
    }
    cout << endl;
    cout << "  → 层数 = log2(n)，每层处理 n 个元素" << endl;
    cout << "  → 总复杂度 = O(n log n)" << endl;
    cout << "  → 而且【最好/最坏/平均】都是 O(n log n)" << endl;
    cout << "  → 代价：需要 O(n) 的额外空间（temp 数组）" << endl;
    cout << endl;

    // ---------- 5. 外部排序 ----------
    cout << "【5. 应用：外部排序（大数据）】" << endl;
    cout << "----------------------------------------" << endl;
    externalSortDemo();

    // ---------- 6. 与其他 O(n log n) 算法对比 ----------
    cout << "【6. 三种 O(n log n) 算法对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  算法      平均      最坏      空间    稳定   实际速度" << endl;
    cout << "  快速      nlogn     n^2       logn    否     最快" << endl;
    cout << "  堆        nlogn     nlogn     1       否     较慢" << endl;
    cout << "  归并      nlogn     nlogn     n       是     中等" << endl;
    cout << endl;
    cout << "  选择建议：" << endl;
    cout << "    要稳定 → 归并" << endl;
    cout << "    要最坏保证 + 省内存 → 堆排序" << endl;
    cout << "    一般情况求快 → 快排" << endl;
    cout << "    外存排序 → 归并" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 归并 = 分治 + 合并两个有序表" << endl;
    cout << "  2. 时间: 最好/最坏/平均 都是 O(n log n)" << endl;
    cout << "  3. 空间: O(n)（需要额外数组）" << endl;
    cout << "  4. 稳定（靠 a[i] <= a[j]）" << endl;
    cout << "  5. 外排序的基础（分块+多路归并）" << endl;
    cout << "========================================" << endl;

    return 0;
}
