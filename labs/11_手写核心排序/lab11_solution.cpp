// ============================================================================
// 第 11 关【参考答案】：手写核心排序（7 大经典比较排序全家桶）
// 对应笔记：《07-排序.md》7.1 ~ 7.3
// ============================================================================

#include <iostream>
#include <string>
#include <utility>
#include <vector>
#include "../common/test_kit.h"

// ============================== 参考实现 ==============================

// 1. 冒泡排序（结合教材 pos 优化：记录本趟最后一次交换位置作为下趟边界）
void bubbleSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    int bound = n - 1;
    while (bound > 0) {
        int lastSwap = 0;
        for (int j = 0; j < bound; ++j) {
            if (a[j] > a[j + 1]) {
                std::swap(a[j], a[j + 1]);
                lastSwap = j;
            }
        }
        // 若本趟没有发生任何交换，lastSwap == 0，循环立即结束
        bound = lastSwap;
    }
}

// 2. 直接插入排序（0-based，局部变量 key 对应教材哨兵 r[0]）
void insertionSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    for (int i = 1; i < n; ++i) {
        int key = a[i];
        int j = i - 1;
        while (j >= 0 && a[j] > key) {
            a[j + 1] = a[j];
            --j;
        }
        a[j + 1] = key;
    }
}

// 3. 简单选择排序（教材 7.2.3）
void selectionSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    for (int i = 0; i < n - 1; ++i) {
        int minIdx = i;
        for (int j = i + 1; j < n; ++j) {
            if (a[j] < a[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            std::swap(a[i], a[minIdx]);
        }
    }
}

// 4. 希尔排序（gap = n/2; gap > 0; gap /= 2）
void shellSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; ++i) {
            int key = a[i];
            int j = i;
            while (j >= gap && a[j - gap] > key) {
                a[j] = a[j - gap];
                j -= gap;
            }
            a[j] = key;
        }
    }
}

// 5. 快速排序（经典挖坑法分区，全相等数组安全不死循环）
int partition(std::vector<int>& a, int left, int right) {
    int pivot = a[left];
    int i = left;
    int j = right;
    while (i < j) {
        while (i < j && a[j] >= pivot) {
            --j;
        }
        a[i] = a[j];
        while (i < j && a[i] <= pivot) {
            ++i;
        }
        a[j] = a[i];
    }
    a[i] = pivot;
    return i;
}

void quickSortRange(std::vector<int>& a, int left, int right) {
    if (left >= right) {
        return;
    }
    int p = partition(a, left, right);
    quickSortRange(a, left, p - 1);
    quickSortRange(a, p + 1, right);
}

void quickSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    if (n <= 1) {
        return;
    }
    quickSortRange(a, 0, n - 1);
}

// 6. 堆排序（0-based 大顶堆：左孩子 2*cur+1，右孩子 2*cur+2，最后非叶 n/2-1）
void siftDown(std::vector<int>& a, int heapSize, int root) {
    int cur = root;
    while (true) {
        int left = 2 * cur + 1;
        int right = 2 * cur + 2;
        int largest = cur;
        if (left < heapSize && a[left] > a[largest]) {
            largest = left;
        }
        if (right < heapSize && a[right] > a[largest]) {
            largest = right;
        }
        if (largest == cur) {
            break;
        }
        std::swap(a[cur], a[largest]);
        cur = largest;
    }
}

void heapSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    if (n <= 1) {
        return;
    }
    // 从最后一个非叶子节点自底向上建大顶堆
    for (int i = n / 2 - 1; i >= 0; --i) {
        siftDown(a, n, i);
    }
    // 依次把堆顶最大值放到数组末尾，并把剩余 [0..end-1] 重新下滤
    for (int end = n - 1; end > 0; --end) {
        std::swap(a[0], a[end]);
        siftDown(a, end, 0);
    }
}

// 7. 归并排序（二路归并，复用辅助数组 tmp）
void mergeRanges(std::vector<int>& a, std::vector<int>& tmp, int left, int mid, int right) {
    int i = left;
    int j = mid + 1;
    int k = left;
    while (i <= mid && j <= right) {
        if (a[i] <= a[j]) {
            tmp[k++] = a[i++];
        } else {
            tmp[k++] = a[j++];
        }
    }
    while (i <= mid) {
        tmp[k++] = a[i++];
    }
    while (j <= right) {
        tmp[k++] = a[j++];
    }
    for (int p = left; p <= right; ++p) {
        a[p] = tmp[p];
    }
}

void mergeSortRange(std::vector<int>& a, std::vector<int>& tmp, int left, int right) {
    if (left >= right) {
        return;
    }
    int mid = left + (right - left) / 2;
    mergeSortRange(a, tmp, left, mid);
    mergeSortRange(a, tmp, mid + 1, right);
    mergeRanges(a, tmp, left, mid, right);
}

void mergeSort(std::vector<int>& a) {
    int n = static_cast<int>(a.size());
    if (n <= 1) {
        return;
    }
    std::vector<int> tmp(n);
    mergeSortRange(a, tmp, 0, n - 1);
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
