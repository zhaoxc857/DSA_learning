/**
 * ============================================================================
 * 关卡 02：动态顺序表手写实战（SeqList）
 * 对应章节：教材第 2 章《线性表》顺序存储结构
 *
 * 【本关最核心的易错点：位序 vs 下标！】
 *   - 逻辑“位序 pos”从 1 开始计数：第 1 个元素、第 2 个元素、...、第 length 个元素
 *   - 数组“下标 idx”从 0 开始计数：data[0]、data[1]、...、data[length - 1]
 *   - 永远牢记换算公式：第 pos 个元素  <===>  data[pos - 1]
 *   - 插入元素：必须“从后往前”挪动，否则后面的元素会被覆盖！
 *   - 删除元素：必须“从前往后”挪动，把空位填上！
 *
 * 【编译与自测命令】（在 labs 目录下执行）
 *   python judge.py 02
 * ============================================================================
 */

#include <iostream>
#include <vector>
#include "../common/test_kit.h"

struct SeqList {
    int* data;     // 指向动态分配的连续数组
    int length;    // 当前已存放的有效元素个数
    int capacity;  // 当前数组的总容量（最多能装多少个 int）
};

// ============================================================================
// 函数 1：初始化顺序表
// 【函数目标】
//   为顺序表 L 分配初始容量为 initCap 的动态数组，并将当前长度设为 0。
//   参数：L 为顺序表引用，initCap 为期望的初始容量。
//   返回值：无。
// 【画图与思路推导】
//   1. 防御性处理：如果 initCap <= 0，令 initCap = 4（给一个安全的默认容量）。
//   2. L.data = new int[initCap];
//   3. L.length = 0;
//   4. L.capacity = initCap;
// 【边界提醒】
//   - 刚初始化完的表里没有有效元素，所以 L.length 必须是 0，而 L.capacity 是 initCap！
// ============================================================================
void initList(SeqList& L, int initCap) {
    // TODO: 请动态申请容量为 initCap 的数组，并初始化 length 与 capacity
    (void)L;
    (void)initCap;
}

// ============================================================================
// 函数 2：销毁顺序表
// 【函数目标】
//   释放顺序表占用的堆内存，并将所有成员归零，彻底杜绝野指针。
//   参数：L 为顺序表引用。
//   返回值：无。
// 【画图与思路推导】
//   1. delete[] L.data;      // 注意：new[] 申请的必须配 delete[]！（对 nullptr 执行 delete[] 是安全的）
//   2. L.data = nullptr;
//   3. L.length = 0;
//   4. L.capacity = 0;
// 【边界提醒】
//   - 释放后不把 L.data 置为 nullptr，如果再次调用 destroyList 就会触发二次释放崩溃！
// ============================================================================
void destroyList(SeqList& L) {
    // TODO: 请用 delete[] 释放 L.data，并将 data/length/capacity 全部归零
    (void)L;
}

// ============================================================================
// 函数 3：按位序查找（随机访问 O(1)）
// 【函数目标】
//   获取顺序表 L 中第 pos 个元素（位序 pos 范围：1 .. L.length），存入 outVal。
//   参数：L 为只读引用，pos 为 1-based 位序，outVal 为输出参数。
//   返回值：位序合法返回 true，越界或表未初始化返回 false（且不改动 outVal）。
// 【画图与思路推导】
//   1. 检查合法性：if (L.data == nullptr || pos < 1 || pos > L.length) return false;
//   2. 取出元素：outVal = L.data[pos - 1];   // 位序减 1 得下标！
//   3. 返回 true。
// 【边界提醒】
//   - 空表（L.length == 0）时，任何 pos（包括 pos == 1）都不满足 pos <= L.length，自动返回 false。
// ============================================================================
bool getElem(const SeqList& L, int pos, int& outVal) {
    // TODO: 请检查 pos 合法性（1..L.length），合法则通过 outVal 返回 L.data[pos - 1]
    (void)L;
    (void)pos;
    (void)outVal;
    return false;
}

// ============================================================================
// 函数 4：按值查找（顺序查找 O(n)）
// 【函数目标】
//   在顺序表 L 中从头到尾查找第一次等于 x 的元素，返回它的“位序”（1 .. L.length）。
//   参数：L 为只读引用，x 为待查找目标值。
//   返回值：找到则返回首次出现的位序（下标 + 1）；找不到返回 0。
// 【画图与思路推导】
//   1. 若 L.data == nullptr，直接返回 0。
//   2. for (int i = 0; i < L.length; ++i)：
//        若 L.data[i] == x，立刻 return i + 1;  // 千万别忘了 + 1 转成位序！
//   3. 整个循环结束都没找到，return 0;
// 【边界提醒】
//   - 约定“找不到返回 0”，正是因为合法位序从 1 开始！
//   - 若表中有多个 x，返回最靠前的那一个（首次出现）。
// ============================================================================
int locateElem(const SeqList& L, int x) {
    // TODO: 请遍历查找 x，找到返回位序 (i + 1)，找不到返回 0
    (void)L;
    (void)x;
    return 0;
}

// ============================================================================
// 函数 5：按位序插入（支持满时自动 2 倍扩容）
// 【函数目标】
//   在顺序表 L 的第 pos 个位置插入新元素 x（合法位序：1 .. L.length + 1）。
//   若插入前数组已满（L.length >= L.capacity），自动扩容为原来的 2 倍后再插入。
//   参数：L 为顺序表引用，pos 为插入位序，x 为新元素值。
//   返回值：成功返回 true；pos 非法返回 false。
// 【画图与思路推导】
//   例：data = [10, 20, 40], length = 3，在 pos = 3（下标 2）插入 30：
//       搬移方向：从后往前！把下标 2 的 40 搬到下标 3 -> [10, 20, _, 40] -> 填入 30。
//   1. 检查位序合法性：if (pos < 1 || pos > L.length + 1) return false;
//   2. 若已满（L.length >= L.capacity）：
//        - 计算新容量：int newCap = (L.capacity <= 0) ? 4 : L.capacity * 2;
//        - 申请新数组：int* newData = new int[newCap];
//        - 拷贝旧元素：for (int i = 0; i < L.length; ++i) newData[i] = L.data[i];
//        - 释放旧数组并接管：delete[] L.data; L.data = newData; L.capacity = newCap;
//   3. 从后往前搬移元素，给下标 pos - 1 腾出空位：
//        for (int i = L.length; i >= pos; --i) {
//            L.data[i] = L.data[i - 1];
//        }
//   4. 放入新元素并更新长度：
//        L.data[pos - 1] = x;
//        L.length++;
//        return true;
// 【边界提醒】
//   - 表尾追加时 pos == L.length + 1，上面的搬移循环一次都不执行，直接落在 data[L.length]，完美！
//   - 扩容时别忘了 delete[] L.data，否则会内存泄漏！
// ============================================================================
bool insertElem(SeqList& L, int pos, int x) {
    // TODO: 请实现合法性检查、满时 2 倍扩容、从后往前搬移以及插入操作
    (void)L;
    (void)pos;
    (void)x;
    return false;
}

// ============================================================================
// 函数 6：按位序删除
// 【函数目标】
//   删除顺序表 L 中第 pos 个元素（合法位序：1 .. L.length），将被删元素存入 removedVal。
//   参数：L 为顺序表引用，pos 为删除位序，removedVal 为输出参数。
//   返回值：成功返回 true；pos 非法或空表返回 false（且不改动 removedVal）。
// 【画图与思路推导】
//   例：data = [10, 20, 30, 40], length = 4，删除 pos = 2（下标 1 的 20）：
//       搬移方向：从前往后！30 覆写到下标 1，40 覆写到下标 2 -> [10, 30, 40]，length = 3。
//   1. 检查合法性：if (L.data == nullptr || pos < 1 || pos > L.length) return false;
//   2. 先备份要删的值：removedVal = L.data[pos - 1];
//   3. 从前往后覆盖搬移：
//        for (int i = pos; i < L.length; ++i) {
//            L.data[i - 1] = L.data[i];
//        }
//   4. 长度减 1：L.length--;
//   5. 返回 true。
// 【边界提醒】
//   - 必须先保存 removedVal 再搬移，否则 L.data[pos - 1] 会被后面的元素覆盖掉！
//   - 删除表尾元素（pos == L.length）时搬移循环执行 0 次，直接 length-- 即可。
// ============================================================================
bool deleteElem(SeqList& L, int pos, int& removedVal) {
    // TODO: 请实现合法性检查、备份 removedVal、从前往后搬移与长度减 1
    (void)L;
    (void)pos;
    (void)removedVal;
    return false;
}

// ============================================================================
// 函数 7：原地删除所有等于 x 的元素（快慢指针 O(n)）
// 【函数目标】
//   将顺序表 L 中所有值等于 x 的元素全部删除，保持其余元素的相对先后顺序不变。
//   要求时间复杂度 O(n)、额外空间复杂度 O(1)（不要反复调用 deleteElem 造成 O(n^2)！）。
//   参数：L 为顺序表引用，x 为要清除的目标值。
//   返回值：总共删除的元素个数。
// 【画图与思路推导】
//   快慢双指针思想（教材/考研高频真题！）：
//     - fast（快指针）：从 0 走到 L.length - 1，负责“扫描”每一个元素；
//     - slow（慢指针）：指向“保留区”的下一个可写入位置，初始为 0。
//   1. 若 L.data == nullptr || L.length == 0，返回 0。
//   2. int slow = 0;
//   3. for (int fast = 0; fast < L.length; ++fast):
//        如果 L.data[fast] != x（是需要保留的好元素）：
//            L.data[slow] = L.data[fast];
//            slow++;
//   4. 删除个数 = L.length - slow;
//   5. 更新表长：L.length = slow;
//   6. 返回删除个数。
// 【边界提醒】
//   - 连续多个 x 挨在一起（如 [3, 3, 1, 3, 3]）时，快慢指针天然不会漏删！
//   - 如果所有元素都等于 x，循环结束后 slow == 0，L.length 变为 0，返回原长度。
// ============================================================================
int removeAllValue(SeqList& L, int x) {
    // TODO: 请用快慢双指针在 O(n) 时间内原地删除所有等于 x 的元素，并返回删除个数
    (void)L;
    (void)x;
    return 0;
}

// ============================================================================
// 以下为自动测试代码（请勿修改 main 中的测试用例）
// ============================================================================
namespace {

std::vector<int> toVector(const SeqList& L) {
    std::vector<int> v;
    if (L.data == nullptr || L.length <= 0) {
        return v;
    }
    v.assign(L.data, L.data + L.length);
    return v;
}

} // namespace

int main() {
    labtest::beginLab("Lab 02：动态顺序表手写（初始化/查/插/删/自动扩容/快慢指针）");

    SeqList L = {nullptr, 0, 0};

    // --- 1. 初始化与空表边界 ---
    initList(L, 2);
    labtest::expectTrue("initList(L, 2) 分配了内存", L.data != nullptr,
                        "请用 new int[initCap] 给 L.data 分配空间");
    labtest::expectEqInt("initList(L, 2) 初始 length 为 0", 0, L.length,
                         "刚初始化完的顺序表是空的，L.length 必须为 0");
    labtest::expectEqInt("initList(L, 2) 初始 capacity 为 2", 2, L.capacity,
                         "请将 L.capacity 设为 initCap");

    int val = -999;
    labtest::expectTrue("空表 getElem(L, 1) 返回 false", !getElem(L, 1, val),
                        "空表 length==0，pos=1 越界，应返回 false");
    labtest::expectEqInt("空表 getElem 失败时不修改 outVal", -999, val,
                         "getElem 返回 false 前不要修改 outVal");
    labtest::expectEqInt("空表 locateElem(L, 10) 返回 0", 0, locateElem(L, 10),
                         "找不到元素时统一返回 0");
    labtest::expectTrue("空表 deleteElem(L, 1) 返回 false", !deleteElem(L, 1, val),
                        "空表无法删除，应返回 false");

    // --- 2. 表头/表尾/中间插入 + 自动 2 倍扩容 ---
    labtest::expectTrue("向空表 pos=1 插入 20", insertElem(L, 1, 20),
                        "空表允许在 pos=1 (即 length+1) 插入第一个元素");
    labtest::expectTrue("表头 pos=1 插入 10", insertElem(L, 1, 10),
                        "在表头插入时需把原元素从后往前右移一位");
    labtest::expectEqVec("满载前内容 [10, 20]", {10, 20}, toVector(L),
                         "请检查插入搬移方向是否为从后往前，且放在 L.data[pos - 1]");

    // 当前 length==2, capacity==2，下次插入必须触发 2 倍扩容 (2 -> 4)
    labtest::expectTrue("表尾 pos=3 插入 40（触发第1次扩容）", insertElem(L, 3, 40),
                        "当 L.length >= L.capacity 时应自动 2 倍扩容，再执行插入");
    labtest::expectEqInt("第1次扩容后 capacity 翻倍为 4", 4, L.capacity,
                         "扩容策略应为 newCap = L.capacity * 2，并记得更新 L.capacity");
    labtest::expectEqVec("第1次扩容后内容 [10, 20, 40]", {10, 20, 40}, toVector(L),
                         "扩容时必须把旧数组 0..length-1 的元素完整拷贝到新数组");

    labtest::expectTrue("中间 pos=3 插入 30", insertElem(L, 3, 30),
                        "在位序 3 插入 30 时应把原位序 3 的 40 挪到下标 3");
    labtest::expectEqVec("中间插入后内容 [10, 20, 30, 40]", {10, 20, 30, 40}, toVector(L),
                         "请检查搬移循环范围 for (int i = L.length; i >= pos; --i)");

    // 当前 length==4, capacity==4，再插入触发第 2 次扩容 (4 -> 8)
    labtest::expectTrue("表尾 pos=5 插入 50（触发第2次扩容）", insertElem(L, 5, 50),
                        "表满后应再次触发自动 2 倍扩容");
    labtest::expectEqInt("第2次扩容后 capacity 翻倍为 8", 8, L.capacity,
                         "容量 4 满载后再插入应扩容至 8");
    labtest::expectEqVec("连续插入后内容 [10, 20, 30, 40, 50]", {10, 20, 30, 40, 50}, toVector(L),
                         "请检查扩容拷贝与写入位置是否正确");

    // --- 3. 越界插入检查 ---
    labtest::expectTrue("越界插入 pos=0 返回 false", !insertElem(L, 0, 99),
                        "位序从 1 开始，pos < 1 必须拒绝");
    labtest::expectTrue("越界插入 pos=-2 返回 false", !insertElem(L, -2, 99),
                        "负数位序必须返回 false");
    labtest::expectTrue("越界插入 pos=length+2 (7) 返回 false", !insertElem(L, 7, 99),
                        "最大合法插入位序是 L.length + 1，不能跨空位插入");
    labtest::expectEqInt("越界插入失败后 length 保持 5", 5, L.length,
                         "非法插入不得修改 L.length 或数组内容");

    // --- 4. getElem 与 locateElem ---
    int got = 0;
    labtest::expectTrue("getElem 表头 pos=1 成功", getElem(L, 1, got) && got == 10,
                        "第 1 个元素应存放在 L.data[0]，即 10");
    labtest::expectTrue("getElem 中间 pos=3 成功", getElem(L, 3, got) && got == 30,
                        "第 3 个元素应存放在 L.data[2]，即 30");
    labtest::expectTrue("getElem 表尾 pos=5 成功", getElem(L, 5, got) && got == 50,
                        "第 5 个元素应存放在 L.data[4]，即 50");
    labtest::expectTrue("getElem 越界 pos=0 返回 false", !getElem(L, 0, got),
                        "pos=0 非法，应返回 false");
    labtest::expectTrue("getElem 越界 pos=6 返回 false", !getElem(L, 6, got),
                        "pos > L.length 非法，应返回 false");

    labtest::expectEqInt("locateElem 查找表头 10 返回位序 1", 1, locateElem(L, 10),
                         "注意返回的是 1-based 位序 (i + 1)，不是 0-based 下标！");
    labtest::expectEqInt("locateElem 查找表尾 50 返回位序 5", 5, locateElem(L, 50),
                         "表尾下标 4 对应位序 5");
    labtest::expectEqInt("locateElem 查找不存在的 999 返回 0", 0, locateElem(L, 999),
                         "遍历完未找到时应返回 0");

    // --- 5. deleteElem 常规与全删空 ---
    int removed = -1;
    labtest::expectTrue("deleteElem 越界 pos=0 返回 false", !deleteElem(L, 0, removed),
                        "pos < 1 非法，应返回 false");
    labtest::expectTrue("deleteElem 越界 pos=6 返回 false", !deleteElem(L, 6, removed),
                        "pos > L.length 非法，应返回 false");

    labtest::expectTrue("deleteElem 删除表头 pos=1", deleteElem(L, 1, removed) && removed == 10,
                        "删除 pos=1 应先保存 removedVal=10，再从前往后把后续元素左移");
    labtest::expectEqVec("删除表头后内容 [20, 30, 40, 50]", {20, 30, 40, 50}, toVector(L),
                         "请检查删除时的搬移循环：for (int i = pos; i < L.length; ++i) L.data[i-1]=L.data[i]");

    labtest::expectTrue("deleteElem 删除中间 pos=2", deleteElem(L, 2, removed) && removed == 30,
                        "当前表第 2 个元素是 30，请检查 removedVal 赋值时机");
    labtest::expectEqVec("删除中间后内容 [20, 40, 50]", {20, 40, 50}, toVector(L),
                         "删除后 40 和 50 应依次前移");

    labtest::expectTrue("deleteElem 删除表尾 pos=3", deleteElem(L, 3, removed) && removed == 50,
                        "删除最后一个元素时搬移 0 次，length 减 1");
    labtest::expectEqVec("删除表尾后内容 [20, 40]", {20, 40}, toVector(L),
                         "剩余元素应为 [20, 40]");

    labtest::expectTrue("连续删空-删第1个(20)", deleteElem(L, 1, removed) && removed == 20,
                        "删除后应仅剩 [40]");
    labtest::expectTrue("连续删空-删最后1个(40)", deleteElem(L, 1, removed) && removed == 40,
                        "单元素删除后表长变为 0");
    labtest::expectEqInt("全删空后 length 为 0", 0, L.length,
                         "所有元素删光后 L.length 应为 0");
    labtest::expectTrue("全删空后再次 deleteElem 返回 false", !deleteElem(L, 1, removed),
                        "空表上继续删除应返回 false");

    // --- 6. removeAllValue 快慢指针原地去值 ---
    {
        int sample[] = {3, 3, 1, 3, 2, 3, 3, 4, 3};
        for (int i = 0; i < 9; ++i) {
            insertElem(L, L.length + 1, sample[i]);
        }
        // 顺带测一下重复值时 locateElem 返回首次出现的位序
        labtest::expectEqInt("重复元素 locateElem(L, 3) 返回首次出现位序 1", 1, locateElem(L, 3),
                             "有多个相同值时应返回最靠前的位序");

        int cnt = removeAllValue(L, 3);
        labtest::expectEqInt("removeAllValue 删除连续重复的 3 返回个数 6", 6, cnt,
                             "共 6 个 3（含表头、表尾和连续相邻），请用快慢指针一次遍历统计");
        labtest::expectEqVec("removeAllValue 删除所有 3 后剩余 [1, 2, 4]", {1, 2, 4}, toVector(L),
                             "非目标元素应保持原有相对顺序紧缩到数组前面");

        int cntNone = removeAllValue(L, 99);
        labtest::expectEqInt("removeAllValue 删除不存在的值返回 0", 0, cntNone,
                             "表中没有 99，应返回 0 且表内容不变");
        labtest::expectEqVec("删除不存在值后内容仍为 [1, 2, 4]", {1, 2, 4}, toVector(L),
                             "元素不应被误删");

        // 全相同元素测试
        destroyList(L);
        initList(L, 4);
        for (int i = 0; i < 4; ++i) insertElem(L, L.length + 1, 7);
        int cntAll = removeAllValue(L, 7);
        labtest::expectEqInt("removeAllValue 全相同元素 [7,7,7,7] 返回 4", 4, cntAll,
                             "所有元素都被删除时应返回原长度 4");
        labtest::expectEqVec("removeAllValue 全删后为空表 []", {}, toVector(L),
                             "全部删除后 L.length 必须更新为 0");
        labtest::expectEqInt("空表调用 removeAllValue 返回 0", 0, removeAllValue(L, 7),
                             "空表调用应安全返回 0");
    }

    // --- 7. destroyList 销毁与防二次释放 ---
    destroyList(L);
    labtest::expectTrue("destroyList 后 data==nullptr 且 length/capacity 归零",
                        L.data == nullptr && L.length == 0 && L.capacity == 0,
                        "destroyList 必须 delete[] L.data 并将 data/length/capacity 全部归零");
    destroyList(L);
    labtest::expectTrue("重复调用 destroyList 安全不崩溃",
                        L.data == nullptr && L.length == 0 && L.capacity == 0,
                        "data 已为 nullptr 时，delete[] nullptr 是 C++ 标准保证的安全空操作");

    return labtest::endLab();
}
