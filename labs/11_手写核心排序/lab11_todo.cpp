// ============================================================================
// 第 11 关：手写核心排序（7 大经典比较排序全家桶）
// 对应笔记：《07-排序.md》7.1 ~ 7.3
//
// 【重要约定：0-based 下标 vs 教材 1-based 哨兵写法】
//   教材（《07-排序.md》）常用 r[1..n] 存数据，用 r[0] 作为“哨兵 / 暂存单元”。
//   现代 C++ 工程与机试统一使用 0-based（a[0..n-1]）：
//     - 原来存放在 r[0] 的哨兵/暂存值  ==>  改用局部变量 int key / int pivot；
//     - 原来判哨兵防越界 r[0]          ==>  改用显式条件 j >= 0（或 j >= gap）；
//     - 原来堆排序的左/右孩子 2i, 2i+1 ==>  0-based 对应 2*i + 1, 2*i + 2，
//       最后一个非叶子节点从 n/2       ==>  0-based 对应 n/2 - 1。
//   本关所有函数均对 std::vector<int>& a 进行【原地升序】排序！
//
// 编译评测命令（在 labs 目录下）：
//   python judge.py 11
// ============================================================================

#include <iostream>
#include <string>
#include <utility>
#include <vector>
#include "../common/test_kit.h"

// ============================ 待你实现的函数区域 ============================

// ----------------------------------------------------------------------------
// 任务 1：冒泡排序（带提前结束优化）
// 【函数目标】
//   对数组 a 原地升序排序，并带提前结束优化（已有序时仅需 1 趟 O(n)）。
//
// 【与教材 r[1..n] 对照】
//   教材 7.2.2 用变量 pos/exchange 记录本趟最后一次交换的位置作为下一趟上界（pos==0 停）；
//   等价地，也可以用 bool swapped 标记本趟是否发生交换（或直接用 lastSwap / bound 优化）。
//
// 【画图与思路推导】
//   1. int n = static_cast<int>(a.size()); 若 n <= 1 直接 return。
//   2. 写法 A（swapped 优化）：
//      外层 for (int pass = 0; pass < n - 1; ++pass)：
//        bool swapped = false;
//        内层 for (int j = 0; j < n - 1 - pass; ++j)：
//          若 a[j] > a[j + 1]，交换并置 swapped = true。
//        若 !swapped，说明数组已经完全有序，立刻 break！
//      （写法 B：用 bound = n - 1 记录每趟最后一次交换下标 lastSwap，下一趟令 bound = lastSwap，
//        直到 bound == 0，就是教材 pos 优化的 0-based 版本！）
//
// 【边界提醒】
//   - 内层访问 a[j + 1]，所以 j 必须严格小于 bound（或 n - 1 - pass），防止越界！
//   - 比较用严格大于 a[j] > a[j + 1] 才能保持【稳定性】。
// ----------------------------------------------------------------------------
void bubbleSort(std::vector<int>& a) {
    // TODO: 实现带提前结束优化的冒泡排序
    (void)a;
}

// ----------------------------------------------------------------------------
// 任务 2：直接插入排序
// 【函数目标】
//   对数组 a 原地升序排序（扑克牌理牌思想，稳定排序，近乎有序时接近 O(n)）。
//
// 【与教材 r[1..n] 对照】
//   教材：r[0] = r[i]; for (j = i - 1; r[0] < r[j]; --j) r[j + 1] = r[j]; r[j + 1] = r[0];
//   0-based：用局部变量 int key = a[i] 代替 r[0]，并把循环条件写成 j >= 0 && a[j] > key。
//
// 【画图与思路推导】
//   1. int n = static_cast<int>(a.size());
//   2. 从 i = 1 到 n - 1，把 a[i] 插入前面已有序的区间 a[0..i-1]：
//      - int key = a[i];
//      - int j = i - 1;
//      - while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; --j; }
//      - a[j + 1] = key;
//
// 【边界提醒】
//   - while 条件必须把 j >= 0 写在 a[j] > key【前面】（短路求值防越界访问 a[-1]）！
//   - 用 a[j] > key（严格大于）保持相等元素的原始顺序（稳定性）。
// ----------------------------------------------------------------------------
void insertionSort(std::vector<int>& a) {
    // TODO: 实现直接插入排序
    (void)a;
}

// ----------------------------------------------------------------------------
// 任务 3：简单选择排序（教材 7.2.3）
// 【函数目标】
//   对数组 a 原地升序排序：每一轮从未排序区间挑出最小值，放到已排序区间的末尾。
//
// 【与教材 r[1..n] 对照】
//   教材：for (i = 1; i < n; ++i) 在 r[i..n] 找最小下标 k，若 k != i 交换 r[i] 和 r[k]。
//   0-based：for (int i = 0; i < n - 1; ++i) 在 a[i..n-1] 找最小下标 minIdx。
//
// 【画图与思路推导】
//   1. int n = static_cast<int>(a.size());
//   2. 外层 for (int i = 0; i < n - 1; ++i)：
//      - 先假设 minIdx = i；
//      - 内层 for (int j = i + 1; j < n; ++j)：
//          若 a[j] < a[minIdx]，更新 minIdx = j；
//      - 若 minIdx != i，std::swap(a[i], a[minIdx])。
//
// 【边界提醒】
//   - 空数组 n == 0 时，n - 1 == -1（有符号 int），循环不会执行，安全；
//     千万别把 n 写成 size_t 再做 n - 1！
// ----------------------------------------------------------------------------
void selectionSort(std::vector<int>& a) {
    // TODO: 实现简单选择排序
    (void)a;
}

// ----------------------------------------------------------------------------
// 任务 4：希尔排序（缩小增量排序）
// 【函数目标】
//   使用增量序列 gap = n/2, n/4, ..., 1，对数组 a 执行原地升序希尔排序。
//
// 【与教材 r[1..n] 对照】
//   教材：每趟按步长 d 对 r[d+1..n] 做插入排序，用 r[0] 暂存。
//   0-based：每趟按步长 gap 对 i = gap..n-1 做带步长的直接插入排序，
//   内层循环条件为 j >= gap && a[j - gap] > key（防止 j - gap < 0 越界）。
//
// 【画图与思路推导】
//   1. int n = static_cast<int>(a.size());
//   2. for (int gap = n / 2; gap > 0; gap /= 2)：
//        for (int i = gap; i < n; ++i)：
//          int key = a[i];
//          int j = i;
//          while (j >= gap && a[j - gap] > key) {
//              a[j] = a[j - gap];
//              j -= gap;
//          }
//          a[j] = key;
//
// 【边界提醒】
//   - 希尔排序最后一趟 gap == 1 就是标准直接插入排序，保证最终全局有序。
//   - 注意 j >= gap 写在前面防下标为负！
// ----------------------------------------------------------------------------
void shellSort(std::vector<int>& a) {
    // TODO: 实现希尔排序
    (void)a;
}

// ----------------------------------------------------------------------------
// 任务 5：快速排序（挖坑法分区 + 分治递归）
// 【函数目标】
//   对数组 a 原地升序排序，且必须能正确、快速处理全相等数组（绝不能死循环！）。
//
// 【与教材 r[1..n] 对照】
//   教材 7.3.2：以 r[first] 为枢轴（存入 r[0]），双指针 i=first, j=end 交替向中间夹逼；
//   0-based：用 int pivot = a[left] 代替 r[0]，区间为 [left, right]。
//
// 【画图与思路推导】
//   辅助函数 partition(a, left, right)：
//     1. int pivot = a[left]; int i = left, j = right;
//     2. while (i < j)：
//          a) 从右往左找第一个 < pivot 的元素：
//             while (i < j && a[j] >= pivot) --j;
//             a[i] = a[j];   // 填左坑，右位置 j 变成新坑
//          b) 从左往右找第一个 > pivot 的元素：
//             while (i < j && a[i] <= pivot) ++i;
//             a[j] = a[i];   // 填右坑，左位置 i 变成新坑
//     3. 循环结束时 i == j，把枢轴填入最后的坑：a[i] = pivot; 返回 i。
//
//   递归函数 quickSortRange(a, left, right)：
//     1. 递归出口：if (left >= right) return;
//     2. int p = partition(a, left, right);
//     3. quickSortRange(a, left, p - 1);
//     4. quickSortRange(a, p + 1, right);
//
// 【边界提醒】
//   - 内层两个 while 的比较条件必须带等号（a[j] >= pivot 和 a[i] <= pivot），
//     否则遇到全相等数组或两端等于 pivot 时指针一步不动，必死循环！
//   - 外层 quickSort(a) 中若 a.size() <= 1 直接 return，避免空数组传 right = -1。
// ----------------------------------------------------------------------------
int partition(std::vector<int>& a, int left, int right) {
    // TODO: 实现快排分区（返回枢轴最终下标）
    (void)a;
    (void)left;
    (void)right;
    return left;
}

void quickSortRange(std::vector<int>& a, int left, int right) {
    // TODO: 实现快排递归主体（注意 left >= right 出口）
    (void)a;
    (void)left;
    (void)right;
}

void quickSort(std::vector<int>& a) {
    // TODO: 调用 quickSortRange(a, 0, n - 1)
    (void)a;
}

// ----------------------------------------------------------------------------
// 任务 6：堆排序（大顶堆建堆 + 下滤 siftDown）
// 【函数目标】
//   使用原地大顶堆对数组 a 进行升序排序（时间 O(n log n)，额外空间 O(1)）。
//
// 【与教材 r[1..n] 对照 —— 必看下标换算！】
//   教材 1-based（r[1..n]）：
//     - 父节点 k 的左孩子 = 2*k，右孩子 = 2*k + 1
//     - 最后一个非叶子节点 = n / 2
//   本关 0-based（a[0..n-1]）：
//     - 父节点 root 的左孩子 = 2*root + 1，右孩子 = 2*root + 2
//     - 最后一个非叶子节点 = n / 2 - 1
//
// 【画图与思路推导】
//   辅助函数 siftDown(a, heapSize, root)：
//     1. 当前节点 cur = root。
//     2. while (true)：
//          int left = 2 * cur + 1;
//          int right = 2 * cur + 2;
//          int largest = cur;
//          if (left < heapSize && a[left] > a[largest]) largest = left;
//          if (right < heapSize && a[right] > a[largest]) largest = right;
//          if (largest == cur) break;     // 已满足大顶堆性质，停止下滤
//          std::swap(a[cur], a[largest]);
//          cur = largest;                 // 继续向下调整被换下去的小元素
//
//   主函数 heapSort(a)：
//     1. int n = static_cast<int>(a.size()); 若 n <= 1 return。
//     2. 建大顶堆：从最后一个非叶子节点向上调整到根：
//        for (int i = n / 2 - 1; i >= 0; --i) siftDown(a, n, i);
//     3. 反复把堆顶最大值交换到末尾，并缩小堆规模重新下滤：
//        for (int end = n - 1; end > 0; --end) {
//            std::swap(a[0], a[end]);
//            siftDown(a, end, 0);
//        }
//
// 【边界提醒】
//   - 每次交换完堆顶后，传入 siftDown 的堆大小是 end（不是 n！），
//     否则会把已经归位到末尾的最大元素又重新拉回堆里！
// ----------------------------------------------------------------------------
void siftDown(std::vector<int>& a, int heapSize, int root) {
    // TODO: 实现 0-based 大顶堆下滤调整
    (void)a;
    (void)heapSize;
    (void)root;
}

void heapSort(std::vector<int>& a) {
    // TODO: 建大顶堆 + 逐个交换堆顶到末尾并下滤
    (void)a;
}

// ----------------------------------------------------------------------------
// 任务 7：归并排序（二路归并，稳定 O(n log n)）
// 【函数目标】
//   使用分治法 + 二路归并对数组 a 升序排序。
//
// 【与教材 r[1..n] 对照】
//   教材 7.3.4 使用辅助数组 r1[1..n] 合并 r[s..m] 与 r[m+1..t]；
//   本关在 mergeSort(a) 中一次性开一个同长度的 std::vector<int> tmp(a.size())，
//   递归过程中反复复用 tmp，避免每次递归都申请内存！
//
// 【画图与思路推导】
//   辅助函数 mergeRanges(a, tmp, left, mid, right)：
//     1. 设 i = left（左半段指针），j = mid + 1（右半段指针），k = left（tmp 写入指针）。
//     2. while (i <= mid && j <= right)：
//          若 a[i] <= a[j]（带等号保稳定！），tmp[k++] = a[i++];
//          否则 tmp[k++] = a[j++];
//     3. 把左段或右段剩余元素拷入 tmp：
//          while (i <= mid) tmp[k++] = a[i++];
//          while (j <= right) tmp[k++] = a[j++];
//     4. 把 tmp[left..right] 拷回 a[left..right]！
//
//   递归函数 mergeSortRange(a, tmp, left, right)：
//     1. if (left >= right) return;
//     2. int mid = left + (right - left) / 2;
//     3. mergeSortRange(a, tmp, left, mid);
//     4. mergeSortRange(a, tmp, mid + 1, right);
//     5. mergeRanges(a, tmp, left, mid, right);
//
// 【边界提醒】
//   - 千万别忘记把 tmp[left..right] 拷回原数组 a[left..right]！
//   - 比较写成 a[i] <= a[j]（带等号），确保归并排序的【稳定性】。
// ----------------------------------------------------------------------------
void mergeRanges(std::vector<int>& a, std::vector<int>& tmp, int left, int mid, int right) {
    // TODO: 合并有序区间 a[left..mid] 与 a[mid+1..right]
    (void)a;
    (void)tmp;
    (void)left;
    (void)mid;
    (void)right;
}

void mergeSortRange(std::vector<int>& a, std::vector<int>& tmp, int left, int right) {
    // TODO: 分治递归并调用 mergeRanges
    (void)a;
    (void)tmp;
    (void)left;
    (void)right;
}

void mergeSort(std::vector<int>& a) {
    // TODO: 准备辅助数组 tmp 并调用 mergeSortRange
    (void)a;
}

// ============================== 自动评测代码 ==============================
// 注意：请不要修改 main() 中的测试逻辑！

void runSortSuite(const std::string& algoName,
                  void (*sortFn)(std::vector<int>&),
                  const std::string& extraHint) {
    struct Case {
        std::string name;
        std::vector<int> input;
        std::vector<int> expected;
        std::string hint;
    };

    std::vector<Case> cases = {
        {
            "空数组",
            std::vector<int>(),
            std::vector<int>(),
            "空数组 n==0 时应直接安全返回，注意勿用 size_t 做 n-1 导致下溢。" + extraHint
        },
        {
            "单元素",
            std::vector<int>{42},
            std::vector<int>{42},
            "单元素数组天然有序，检查循环上下界与递归出口。" + extraHint
        },
        {
            "两元素逆序",
            std::vector<int>{2, 1},
            std::vector<int>{1, 2},
            "2 元素逆序最容易暴露边界条件写少 1 步的问题。" + extraHint
        },
        {
            "已正序",
            std::vector<int>{1, 2, 3, 4, 5},
            std::vector<int>{1, 2, 3, 4, 5},
            "已正序数组不应被打乱，冒泡排序应能提前结束。" + extraHint
        },
        {
            "完全逆序",
            std::vector<int>{9, 7, 5, 3, 1},
            std::vector<int>{1, 3, 5, 7, 9},
            "完全逆序是最坏情况之一，检查所有元素是否全部到位。" + extraHint
        },
        {
            "全相等元素",
            std::vector<int>{5, 5, 5, 5, 5},
            std::vector<int>{5, 5, 5, 5, 5},
            "全相等数组极易让快排死循环（必须用 >= 和 <=），请重点检查。" + extraHint
        },
        {
            "含负数与重复元素的乱序数组",
            std::vector<int>{3, -1, 4, 1, 5, -9, 2, 6, 5, 3, 5},
            std::vector<int>{-9, -1, 1, 2, 3, 3, 4, 5, 5, 5, 6},
            "同时测试负数、重复元素与较长乱序数据。" + extraHint
        }
    };

    for (size_t i = 0; i < cases.size(); ++i) {
        std::vector<int> data = cases[i].input;
        sortFn(data);
        labtest::expectEqVec(
            algoName + " - " + cases[i].name,
            cases[i].expected,
            data,
            cases[i].hint);
    }
}

int main() {
    labtest::beginLab("Lab 11: 手写核心排序 (7 大经典排序全面评测)");

    runSortSuite("冒泡排序 bubbleSort", bubbleSort,
                 " [冒泡排查：内层上界 j < bound，swapped/pos 优化]");
    runSortSuite("直接插入 insertionSort", insertionSort,
                 " [插排排查：先判 j >= 0 再比 a[j] > key，最后 a[j+1] = key]");
    runSortSuite("简单选择 selectionSort", selectionSort,
                 " [选排排查：每轮在 [i..n-1] 找 minIdx 后与 a[i] 交换]");
    runSortSuite("希尔排序 shellSort", shellSort,
                 " [希尔排查：gap = n/2 递减到 1，内层步长 gap 且 j >= gap]");
    runSortSuite("快速排序 quickSort", quickSort,
                 " [快排排查：left >= right 出口，partition 用 >= / <= 防死循环]");
    runSortSuite("堆排序 heapSort", heapSort,
                 " [堆排排查：0-based 孩子 2*cur+1 / 2*cur+2，建堆从 n/2-1 开始，下滤规模传 end]");
    runSortSuite("归并排序 mergeSort", mergeSort,
                 " [归并排查：左右余项都要拷入 tmp，最后务必将 tmp[left..right] 拷回 a]");

    return labtest::endLab();
}
