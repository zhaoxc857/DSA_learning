/**
 * ============================================================================
 * 关卡 01：时间复杂度对比与字符频次统计
 * 对应章节：教材第 1 章《1.5 工程实践和思考》例 1.8（CountChar1 vs CountChar2）
 *          + 有序数组双指针降维体验（O(n^2) -> O(n)）
 *
 * 【本关核心体会】
 * 同一个“统计字符串里每个字符出现次数”的问题：
 *   - 版本 1（countCharV1）：把已见过的字符放进结构体数组，每次来新字符就从头扫一遍数组 -> O(m * n)
 *   - 版本 2（countCharV2）：直接拿字符的 ASCII 码当作数组下标 chnum[ch]++（空间换时间）-> O(m)
 * 同理，在有序数组中找两数之和等于 target：
 *   - 暴力两重循环是 O(n^2)，而左右对撞双指针只需一趟扫描 -> O(n)！
 *
 * 【编译与自测命令】（在 labs 目录下执行）
 *   python judge.py 01
 * ============================================================================
 */

#include <cstring>
#include <iostream>
#include <vector>
#include "../common/test_kit.h"

struct CharResult {
    char ch;
    int num;
};

// ============================================================================
// 函数 1：字符频次统计 —— 版本 1（教材例 1.8，结构体数组线性查找 O(mn)）
// 【函数目标】
//   统计 C 风格字符串 s 中每个不同字符的出现次数，按字符“首次出现顺序”
//   存入结构体数组 r[0 .. n-1] 中，并将不同字符的种类数通过引用参数 n 返回。
//   参数：
//     - s：以 '\0' 结尾的字符串（可能为 nullptr 或空串 ""）
//     - r[]：输出数组，调用方保证容量足够（至少 128）
//     - n：输出参数（引用），函数结束后存放实际不同字符的个数
//   返回值：无。
// 【画图与思路推导】
//   1. 先初始化 n = 0；若 s == nullptr，直接 return。
//   2. 外层循环遍历字符串 s[i]，直到 s[i] == '\0'：
//   3.   内层循环在 r[0 .. n-1] 中查找是否已有 r[j].ch == s[i]：
//          - 如果找到：r[j].num++，跳出内层循环；
//          - 如果没找到（遍历完 j == n）：
//              r[n].ch = s[i];
//              r[n].num = 1;
//              n++;
// 【边界提醒】
//   - 调用前 n 里可能是垃圾值，函数一开始必须把 n 归零（n = 0）！
//   - s == nullptr 或 s == ""（空串）时，n 应为 0。
//   - 区分大小写：'T' 和 't' 是两个不同的字符；空格 ' ' 和句号 '.' 也算字符！
// ============================================================================
void countCharV1(const char* s, CharResult r[], int& n) {
    // TODO: 请按教材例 1.8 版本 1 的 O(mn) 思路实现字符统计
    (void)s;
    (void)r;
    n = 0;
}

// ============================================================================
// 函数 2：字符频次统计 —— 版本 2（教材例 1.8，ASCII 桶计数 O(m)）
// 【函数目标】
//   使用长度为 128 的整型数组 chnum[0..127]，直接以字符的 ASCII 码作为下标，
//   统计字符串 s 中每个标准 ASCII 字符（0..127）的出现次数。
//   参数：
//     - s：以 '\0' 结尾的字符串（可能为 nullptr 或空串 ""）
//     - chnum[128]：输出计数数组，chnum[c] 表示 ASCII 码为 c 的字符出现次数
//   返回值：无。
// 【画图与思路推导】
//   1. 第一步必须清零：用 for 循环将 chnum[0..127] 全部置为 0！
//      （哪怕 s == nullptr 也要先清零，防止残留脏数据）
//   2. 若 s == nullptr，直接 return。
//   3. 遍历 s[i] 直到 '\0'：
//        unsigned char uc = static_cast<unsigned char>(s[i]);
//        if (uc < 128) {
//            chnum[uc]++;
//        }
// 【边界提醒】
//   - 为什么一定要转成 unsigned char？
//     因为很多编译器里 char 默认是有符号类型（-128..127），若字符编码 >= 128，
//     直接写 chnum[s[i]] 会出现负下标越界！转成 unsigned char 再判断 < 128 绝对安全。
//   - 别忘了清零 chnum[0..127]，调用方传进来的数组可能装着旧数据！
// ============================================================================
void countCharV2(const char* s, int chnum[128]) {
    // TODO: 请先清零 chnum[0..127]，再以 ASCII 码为下标统计每个字符出现次数
    (void)s;
    (void)chnum;
}

// ============================================================================
// 函数 3：有序数组两数之和的对数统计（双指针 O(n)）
// 【函数目标】
//   给定一个“严格递增”（无重复元素）的有序整型数组 a[0 .. n-1] 和目标值 target，
//   统计有多少对不同下标 (i, j)（满足 0 <= i < j < n）使得 a[i] + a[j] == target。
//   参数：
//     - a[]：严格递增的整型数组（可能为 nullptr）
//     - n：数组长度
//     - target：目标和
//   返回值：满足条件的数对个数（int）。
// 【画图与思路推导】
//   例如 a = [1, 2, 3, 4, 5, 6, 7, 8, 9], target = 10：
//     left 指向最左端(0)，right 指向最右端(n-1)，计数 cnt = 0。
//   1. 边界保护：若 a == nullptr 或 n < 2，直接返回 0。
//   2. 当 left < right 时循环：
//        long long sum = static_cast<long long>(a[left]) + a[right];
//        - 若 sum == target：找到一对！cnt++; 然后 left++; right--;
//          （因为数组严格递增，a[left] 和 a[right] 都不能再和别的数凑出 target 了）
//        - 若 sum < target：当前和偏小，只能让左边变大 -> left++;
//        - 若 sum > target：当前和偏大，只能让右边变小 -> right--;
//   3. 返回 cnt。
// 【边界提醒】
//   - 循环条件是严格小于 left < right，千万不能写成 left <= right，
//     否则同一个元素会“自己加自己”（例如 target=2 时把 1+1 误算成一对）！
//   - 空数组（n == 0）或单元素数组（n == 1）应返回 0。
// ============================================================================
int countPairsSumTarget(const int a[], int n, int target) {
    // TODO: 请用左右对撞双指针在 O(n) 时间内统计满足 a[i] + a[j] == target 的对数
    (void)a;
    (void)n;
    (void)target;
    return 0;
}

// ============================================================================
// 以下为自动测试代码（请勿修改 main 中的测试用例）
// ============================================================================
namespace {

int findInV1(const CharResult r[], int n, char target) {
    for (int i = 0; i < n; ++i) {
        if (r[i].ch == target) {
            return r[i].num;
        }
    }
    return 0;
}

bool compareV1AndV2(const CharResult r[], int n, const int chnum[128]) {
    if (n < 0 || n > 128) return false;
    int seen[128] = {0};
    for (int i = 0; i < n; ++i) {
        unsigned char uc = static_cast<unsigned char>(r[i].ch);
        if (uc >= 128) return false;
        if (seen[uc] != 0) return false; // V1 不应出现重复字符条目
        seen[uc] = r[i].num;
    }
    for (int c = 0; c < 128; ++c) {
        if (seen[c] != chnum[c]) return false;
    }
    return true;
}

} // namespace

int main() {
    labtest::beginLab("Lab 01：复杂度对比、字符频次统计(例1.8)与双指针");

    // --- 1. 教材例 1.8 原句测试 ---
    {
        const char* sentence =
            "This is a problem which can be solved by data structure method.";
        CharResult r[128];
        int n = 999; // 故意放入脏初值，检查函数内是否正确重置 n = 0
        countCharV1(sentence, r, n);

        int chnum[128];
        for (int i = 0; i < 128; ++i) chnum[i] = 777; // 故意放入脏初值，检查函数内是否清零
        countCharV2(sentence, chnum);

        labtest::expectEqInt("例1.8 原句 V1 不同字符种类数", 22, n,
                             "请检查 countCharV1 是否先置 n=0，且区分大小写并统计空格和句号");
        labtest::expectTrue("例1.8 原句 V1 首个记录字符为 'T'", n > 0 && r[0].ch == 'T',
                            "countCharV1 应按字符首次出现顺序追加到 r[0..n-1]");
        labtest::expectEqInt("例1.8 原句 V1 空格 ' ' 次数", 11, findInV1(r, n, ' '),
                             "句子中共有 11 个空格，请检查外层循环是否完整遍历到 '\\0'");
        labtest::expectEqInt("例1.8 原句 V1 字母 'e' 次数", 5, findInV1(r, n, 'e'),
                             "请检查内层循环找到相同字符后是否正确执行 r[j].num++");
        labtest::expectEqInt("例1.8 原句 V1 大写 'T' 与小写 't' 区分", 4, findInV1(r, n, 't'),
                             "小写 't' 出现 4 次，大写 'T' 出现 1 次，二者不应混淆");

        labtest::expectEqInt("例1.8 原句 V2 空格 ' ' 次数", 11, chnum[static_cast<unsigned char>(' ')],
                             "请检查 countCharV2 是否先将 chnum[0..127] 全部清零再累加");
        labtest::expectEqInt("例1.8 原句 V2 字母 'e' 次数", 5, chnum[static_cast<unsigned char>('e')],
                             "请检查是否以 static_cast<unsigned char>(s[i]) 作为下标累加");
        labtest::expectEqInt("例1.8 原句 V2 句号 '.' 次数", 1, chnum[static_cast<unsigned char>('.')],
                             "请检查是否漏掉了最后一个字符 '.'");
        labtest::expectEqInt("例1.8 原句 V2 未出现字符 'z' 次数为 0", 0, chnum[static_cast<unsigned char>('z')],
                             "未出现的字符对应下标必须为 0，请检查是否对 chnum[0..127] 清零");

        int sumV2 = 0;
        for (int c = 0; c < 128; ++c) sumV2 += chnum[c];
        labtest::expectEqInt("例1.8 原句 V2 频次总和等于串长 63",
                             static_cast<int>(std::strlen(sentence)), sumV2,
                             "所有字符频次之和应等于字符串总长度");

        labtest::expectTrue("例1.8 原句 V1 与 V2 统计结果完全一致",
                            compareV1AndV2(r, n, chnum),
                            "V1 和 V2 统计的是同一句话，所有 128 个 ASCII 字符计数应完全一致且 V1 无重复项");
    }

    // --- 2. 字符统计边界测试：空串、nullptr、单字符、全重复 ---
    {
        CharResult r[128];
        int n = 42;
        int chnum[128];
        for (int i = 0; i < 128; ++i) chnum[i] = 5;

        countCharV1("", r, n);
        countCharV2("", chnum);
        labtest::expectEqInt("空串 V1 种类数为 0", 0, n,
                             "空串 \"\" 不含任何字符，n 应为 0");
        bool allZero = true;
        for (int c = 0; c < 128; ++c) {
            if (chnum[c] != 0) allZero = false;
        }
        labtest::expectTrue("空串 V2 计数数组全为 0", allZero,
                            "即使是空串，countCharV2 也必须先把 chnum[0..127] 清零");

        n = 42;
        for (int i = 0; i < 128; ++i) chnum[i] = 9;
        countCharV1(nullptr, r, n);
        countCharV2(nullptr, chnum);
        labtest::expectEqInt("nullptr 传入 V1 安全返回 n=0", 0, n,
                             "s == nullptr 时应先置 n=0 再安全返回，不可解引用 s");
        bool allZeroNull = true;
        for (int c = 0; c < 128; ++c) {
            if (chnum[c] != 0) allZeroNull = false;
        }
        labtest::expectTrue("nullptr 传入 V2 安全且数组全为 0", allZeroNull,
                            "s == nullptr 时应先清零 chnum[0..127] 再安全返回");

        countCharV1("Z", r, n);
        countCharV2("Z", chnum);
        labtest::expectTrue("单字符 \"Z\" V1 结果正确", n == 1 && r[0].ch == 'Z' && r[0].num == 1,
                            "单字符时 n 应为 1，r[0] 为 {'Z', 1}");
        labtest::expectTrue("单字符 \"Z\" V1 与 V2 一致", compareV1AndV2(r, n, chnum),
                            "请检查单字符场景下 V1 与 V2 是否都只统计了 'Z' 一次");

        countCharV1("aaaaaaa", r, n);
        countCharV2("aaaaaaa", chnum);
        labtest::expectTrue("全重复字符 \"aaaaaaa\" V1 合并为 1 项且计数 7",
                            n == 1 && r[0].ch == 'a' && r[0].num == 7,
                            "相同字符不应重复追加新槽位，应在原有槽位 num++");
        labtest::expectEqInt("全重复字符 \"aaaaaaa\" V2 计数为 7", 7,
                             chnum[static_cast<unsigned char>('a')],
                             "7 个 'a' 在 chnum['a'] 中应为 7");
    }

    // --- 3. 双指针 countPairsSumTarget 测试 ---
    {
        int a1[] = {1, 2, 3, 4, 5, 6, 7, 8, 9};
        labtest::expectEqInt("双指针多解 [1..9] target=10", 4,
                             countPairsSumTarget(a1, 9, 10),
                             "应找到 (1,9),(2,8),(3,7),(4,6) 共 4 对；找到一对后记得 left++ 且 right--");

        int a2[] = {-5, -2, 0, 2, 3, 5, 7};
        labtest::expectEqInt("双指针含负数 target=5", 3,
                             countPairsSumTarget(a2, 7, 5),
                             "应找到 (-2,7),(0,5),(2,3) 共 3 对，注意数组含负数也完全适用双指针");

        int a3[] = {1, 3, 5, 8, 12};
        labtest::expectEqInt("双指针无解 target=100", 0,
                             countPairsSumTarget(a3, 5, 100),
                             "不存在两数之和等于 100，应返回 0");
        labtest::expectEqInt("双指针禁止同一元素自加 target=2", 0,
                             countPairsSumTarget(a3, 5, 2),
                             "循环条件必须是 left < right，不能把 a[0]+a[0]=1+1 算作一对");

        int a4[] = {3, 7};
        labtest::expectEqInt("双指针两元素刚好配对", 1,
                             countPairsSumTarget(a4, 2, 10),
                             "长度为 2 且 3+7==10，应返回 1");

        int a5[] = {5};
        labtest::expectEqInt("双指针单元素数组返回 0", 0,
                             countPairsSumTarget(a5, 1, 10),
                             "长度小于 2 无法组成数对，应返回 0");

        labtest::expectEqInt("双指针空数组 n=0 返回 0", 0,
                             countPairsSumTarget(a1, 0, 10),
                             "n <= 1 时应直接返回 0");
        labtest::expectEqInt("双指针 nullptr 返回 0", 0,
                             countPairsSumTarget(nullptr, 5, 10),
                             "a == nullptr 时应安全返回 0");
    }

    return labtest::endLab();
}
