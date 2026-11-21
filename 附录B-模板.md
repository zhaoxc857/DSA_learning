# 附录 B　模板（教材附录 2）

> **对应教材**：附录 2 模板（教材第 275～277 页）
>
> **为什么要单独写这一篇？**
> 翻开教材第 2～7 章，几乎每个数据结构开头都写着 `template <class T>`。很多刚学完循环、数组、函数的同学一看到 `template`、`<T>`、`SeqList<T>::` 就发怵，以为数据结构有多深奥。
>
> **其实模板一点都不难**——它只是“把数据类型 `int` 换成一个占位符 `T`”。学完这篇，你就能：
> 1. 彻底看懂教材里所有 `template <class T>` 代码；
> 2. 掌握**初学者最实用的手写策略**：平时练习先用具体类型 `int` 写通逻辑，最后花 30 秒套上模板壳；
> 3. 避开教材附录代码里容易让现代 `g++` 报错的几个小坑。

---

## B.1　先看问题：为什么要有模板？

### 【一句话概括】

**模板（Template）= 给“类型”留个空位，让同一套代码能同时处理 `int`、`double`、`char`、`string` 甚至自定义结构体。**

### 【场景：不用模板有多麻烦？】

假设你要写一个求较大值的函数 `Max`：

```cpp
int    Max(int x, int y)       { return x >= y ? x : y; }
double Max(double x, double y) { return x >= y ? x : y; }
char   Max(char x, char y)     { return x >= y ? x : y; }
```

发现没有？这 3 个函数里**逻辑一模一样**，唯一不同的是类型名（`int` / `double` / `char`）。

放到数据结构里更明显：如果你写了一个顺序表 `SeqList`，存学生学号要写一版 `IntSeqList`，存成绩要写一版 `DoubleSeqList`，存姓名又要写一版 `StringSeqList`——重复劳动到崩溃！

**模板的解决办法**：先拿一个字母 `T` 占坑（叫**类型参数**），等你真正用它的时候（比如 `SeqList<int>`），编译器自动把代码里所有的 `T` 替换成 `int` 生成一份真正的代码。

---

## B.2　函数模板（教材附录 2 · 第 1 节）

### 【基本写法】

```cpp
#include <iostream>
using namespace std;

// 声明模板：告诉编译器“下面紧跟着的函数里，T 是一个待定的类型”
template <class T>          // 也可以写成 template <typename T>，完全等价！
T Max(T x, T y) {
    return x >= y ? x : y;
}

int main() {
    cout << Max<int>(3, 5) << endl;     // 显式指定 T = int，输出 5
    cout << Max(3, 5) << endl;          // 自动推导 T = int，输出 5
    cout << Max(3.6, 2.5) << endl;      // 自动推导 T = double，输出 3.6
    cout << Max('a', 'c') << endl;      // 自动推导 T = char，输出 c
    return 0;
}
```

### 【逐词翻译（小白别慌）】

| 语法 | 人话解释 |
|---|---|
| `template <class T>` | “准备造一个模具，模具里有个待填的类型叫 `T`”（这里的 `class` 不是定义类，和 `typename` 意思一样） |
| `T Max(T x, T y)` | 传入两个 `T` 类型的数，返回一个 `T` 类型的数 |
| `Max<int>(3, 5)` | 显式告诉编译器：把 `T` 换成 `int` |
| `Max(3.6, 2.5)` | 省略 `<double>`，编译器看实参类型自动猜出 `T = double` |

> **⚠ 常见坑**：`Max(3, 2.5)` 会**编译报错**！因为 `3` 是 `int`、`2.5` 是 `double`，编译器不知道 `T` 到底该算 `int` 还是 `double`。解决：`Max<double>(3, 2.5)`。

---

## B.3　类模板（教材附录 2 · 第 2 节）⭐ 教材最常用

教材里的 `SeqList`、`LinkList`、`SeqStack`、`BiTree` 全部都是**类模板**。

### 【写法 1：成员函数直接写在类里面（最省心，推荐初学者！）】

```cpp
#include <iostream>
using namespace std;

template <class T>
class Compare {
protected:
    T m_x, m_y;

public:
    Compare(T x, T y) : m_x(x), m_y(y) {}   // 构造函数初始化列表
    T Max() {                                // 直接在类内实现，最不容易写错
        return m_x >= m_y ? m_x : m_y;
    }
};

int main() {
    Compare<int>  c1(3, 5);      // 类模板实例化时，必须写出 <类型>！
    Compare<char> c2('a', 'b');
    cout << c1.Max() << endl;    // 输出 5
    cout << c2.Max() << endl;    // 输出 b
    return 0;
}
```

### 【写法 2：成员函数写在类外面（教材里到处都是这种写法！）】

当你把成员函数移到类大括号外面写时，**必须带三样东西**：

```cpp
template <class T>
class Compare {
protected:
    T m_x, m_y;
public:
    Compare(T x, T y) : m_x(x), m_y(y) {}
    T Max();                     // 类内只写声明
};

// 类外实现必须写全这三部分：
// ① template <class T>          —— 重新声明模板头
// ② T                           —— 返回值类型
// ③ Compare<T>::Max()           —— 作用域里必须带上 <T>！
template <class T>
T Compare<T>::Max() {
    return m_x >= m_y ? m_x : m_y;
}
```

> **⚠ 重要勘误（照抄教材 p.276 会报错的地方！）**
>
> 教材第 276 页有两处印刷疏漏，如果你照着敲进 `g++` 会直接编译失败：
> 1. 教材在类外写成了 `template <class T> T Max()`，漏掉了 **`Compare<T>::`**（不加它，编译器会以为你在写一个普通全局函数，不认识 `m_x` 和 `m_y`）；
> 2. 教材的 `void main()` 在现代标准 C++（`g++`）中是不合规的，应改为 **`int main()`** 并在末尾 `return 0;`。

---

## B.4　带“非类型参数”的类模板（教材 p.276 代码 ③）

模板尖括号 `<>` 里**不仅能放类型，还能放一个编译期确定的整数**（如数组大小 `int n`）：

```cpp
#include <iostream>
#include <cstring>
using namespace std;

template <class T, int n>        // T 是类型参数，n 是整型常量参数
class ArrayMax {
protected:
    T m_data[n];                 // 用 n 直接决定数组长度

public:
    ArrayMax(T a[], int len) {
        int cnt = len < n ? len : n;
        for (int i = 0; i < cnt; i++) m_data[i] = a[i];
    }
    T Max();
};

// 类外实现时，两个参数都要写全！
template <class T, int n>
T ArrayMax<T, n>::Max() {
    int k = 0;
    for (int i = 1; i < n; i++) {
        if (m_data[i] > m_data[k]) k = i;
    }
    return m_data[k];
}

int main() {
    int a[5] = {2, 9, 3, 7, 5};
    ArrayMax<int, 5> obj(a, 5);  // 实例化：T=int, n=5
    cout << obj.Max() << endl;   // 输出 9
    return 0;
}
```

> **提示**：你会在第 2 章顺序表、第 3 章顺序栈/循环队列的静态数组版里见到这种思路（或者用 `const int MaxSize = 100;` / 动态 `new T[maxSize]`）。

---

## B.5　⭐ 初学者实战心法：如何不被模板绊倒？

如果你现在写代码容易被模板语法分心，请严格执行**两步走策略**：

1. **第一步（写通算法逻辑）**：把教材里所有的 `template <class T>` 暂时删掉，把 `T` 全部替换成 `int`，把 `class` 简化成 `struct + 普通函数`（本套笔记的 [`labs/`](labs/README.md) 全部采用这种无干扰风格，让你 100% 专注指针和算法！）。
2. **第二步（还原成教材模板类）**：等 `int` 版本完全跑通后，按下面 4 条规则机械替换即可：
   - 结构体/类定义前加 `template <class T>`；
   - 把存放数据元素的 `int` 改成 `T`（**注意**：下标 `i`、长度 `length`、容量 `maxSize` 依然是 `int`，千万别全替换成 `T`！）；
   - 类外成员函数前加 `template <class T>`，类名后加 `<T>`（如 `SeqList<T>::Insert`）；
   - 在 `main()` 里建对象时补上 `<int>`（如 `SeqList<int> list;`）。

---

## B.6　【本节自测】

**B-1.** 下面这段类外定义为什么编译报错？怎么改？
```cpp
template <class T>
class Box {
    T val;
public:
    Box(T v) : val(v) {}
    T getVal();
};

T Box::getVal() {
    return val;
}
```
<details><summary>点我看答案</summary>
<p><strong>两处错误</strong>：</p>
<ol>
<li>类外定义前漏写了 <code>template &lt;class T&gt;</code>；</li>
<li>作用域 <code>Box::</code> 漏写了模板参数，应写成 <code>Box&lt;T&gt;::</code>。</li>
</ol>
<p><strong>正确写法</strong>：</p>
<pre><code class="language-cpp">template &lt;class T&gt;
T Box&lt;T&gt;::getVal() {
    return val;
}
</code></pre>
</details>

**B-2.** 把 `int` 版的顺序表改成类模板 `SeqList<T>` 时，`int length;` 应该改成 `T length;` 吗？
<details><summary>点我看答案</summary>
<p><strong>绝对不能！</strong></p>
<p><code>T</code> 代表的是表里<strong>存储的元素类型</strong>（比如 <code>string</code>、<code>double</code>、<code>Student</code>）。如果把 <code>length</code> 改成 <code>T</code>，当 <code>T = string</code> 时“表长”就成了字符串，完全荒谬。</p>
<p><strong>口诀</strong>：只有“存数据的那个类型”改成 <code>T</code>；表示<strong>个数、下标、位序、容量</strong>的变量永远保持 <code>int</code>。</p>
</details>

**B-3.** `template <class T>` 和 `template <typename T>` 有什么区别？
<details><summary>点我看答案</summary>
<p>在声明模板类型参数时<strong>完全等价</strong>，没有任何功能区别。教材习惯写 <code>class T</code>，现代 C++ 教材更常写 <code>typename T</code>（避免初学者误以为 <code>T</code> 只能传类而不能传 <code>int</code>）。两种写法都要认识。</p>
</details>

---

**相关阅读**：[第 0 章 0.10 模板速览](00-C与C++基础回顾.md) · [附录 A 异常处理](附录A-异常处理.md) · [写代码通关指南](写代码通关指南.md)
