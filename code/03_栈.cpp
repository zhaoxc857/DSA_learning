// ============================================================
// 03_栈.cpp
// 配套笔记：第 3 章 线性表的扩展 → 3.2 栈的实现
//
// 内容：顺序栈 + 链式栈 + 括号匹配应用
//
// 编译运行：
//   g++ -std=c++11 03_栈.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <string>
#include <stack>
using namespace std;

// ============================================================
// 一、顺序栈
// ============================================================
template <class T>
class SeqStack {
private:
    T*  data;
    int maxSize;
    int top;          // 栈顶下标，-1 表示空栈

public:
    SeqStack(int size = 100) {
        maxSize = size;
        data = new T[maxSize];
        top = -1;
    }
    ~SeqStack() { delete[] data; }

    bool Empty() const { return top == -1; }
    bool Full()  const { return top == maxSize - 1; }
    int  Size()  const { return top + 1; }

    void Push(T x) {
        if (Full()) { cout << "[错误] 栈已满" << endl; return; }
        data[++top] = x;          // ★ 先 ++ 再放
    }

    T Pop() {
        if (Empty()) { cout << "[错误] 栈已空" << endl; return T(); }
        return data[top--];       // ★ 先取再 --
    }

    T Top() const {
        if (Empty()) return T();
        return data[top];
    }

    void Print() const {
        cout << "栈（底→顶）: ";
        for (int i = 0; i <= top; i++) cout << data[i] << " ";
        cout << "(top=" << top << ")" << endl;
    }
};

// ============================================================
// 二、链式栈
// ============================================================
template <class T>
struct StackNode {
    T data;
    StackNode* next;
};

template <class T>
class LinkStack {
private:
    StackNode<T>* top;    // 指向栈顶

public:
    LinkStack() { top = nullptr; }
    ~LinkStack() {
        while (top) {
            StackNode<T>* p = top;
            top = top->next;
            delete p;
        }
    }

    bool Empty() const { return top == nullptr; }

    void Push(T x) {                     // 头插 O(1)
        StackNode<T>* s = new StackNode<T>;
        s->data = x;
        s->next = top;
        top = s;
    }

    T Pop() {                            // 头删 O(1)
        if (Empty()) { cout << "[错误] 栈空" << endl; return T(); }
        T x = top->data;
        StackNode<T>* p = top;
        top = top->next;
        delete p;
        return x;
    }

    T Top() const { return top ? top->data : T(); }
};

// ============================================================
// 三、应用：括号匹配
// ============================================================
bool checkBrackets(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else if (c == ')' || c == ']' || c == '}') {
            if (st.empty()) return false;
            char t = st.top();
            bool match = (c == ')' && t == '(') ||
                         (c == ']' && t == '[') ||
                         (c == '}' && t == '{');
            if (!match) return false;
            st.pop();
        }
    }
    return st.empty();
}

// ============================================================
// 四、应用：十进制转二进制（栈的经典用法）
// ============================================================
string toBinary(int n) {
    if (n == 0) return "0";
    stack<int> st;
    while (n > 0) {
        st.push(n % 2);      // 余数入栈
        n /= 2;
    }
    string result;
    while (!st.empty()) {
        result += char('0' + st.top());   // 出栈（逆序输出）
        st.pop();
    }
    return result;
}

// ============================================================
// 五、应用：逆波兰表达式求值
// ============================================================
// 输入后缀表达式，如 "3 4 + 2 *" 表示 (3+4)*2 = 14
int evalRPN(const string& expr) {
    stack<int> st;
    string num;
    for (size_t i = 0; i <= expr.size(); i++) {
        char c = (i < expr.size()) ? expr[i] : ' ';
        if (c >= '0' && c <= '9') {
            num += c;
        } else if (c == '+' || c == '-' || c == '*' || c == '/') {
            if (!num.empty()) { st.push(stoi(num)); num.clear(); }
            int b = st.top(); st.pop();
            int a = st.top(); st.pop();
            int r = 0;
            if (c == '+') r = a + b;
            else if (c == '-') r = a - b;
            else if (c == '*') r = a * b;
            else r = a / b;
            st.push(r);
        } else {
            if (!num.empty()) { st.push(stoi(num)); num.clear(); }
        }
    }
    return st.empty() ? 0 : st.top();
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  栈 演示" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 顺序栈 ----------
    cout << "【1. 顺序栈基本操作】" << endl;
    SeqStack<int> ss(5);
    ss.Push(1); ss.Push(2); ss.Push(3);
    ss.Print();                                  // 1 2 3
    cout << "  Top() = " << ss.Top() << endl;    // 3
    cout << "  Pop() = " << ss.Pop() << endl;    // 3
    ss.Print();                                  // 1 2
    cout << "  Pop() = " << ss.Pop() << endl;    // 2
    cout << "  Pop() = " << ss.Pop() << endl;    // 1
    cout << "  现在 Empty() = " << ss.Empty() << endl;
    cout << "  对空栈 Pop: "; ss.Pop();
    cout << endl;

    // ---------- 2. 链式栈 ----------
    cout << "【2. 链式栈】" << endl;
    LinkStack<int> ls;
    for (int i = 1; i <= 3; i++) ls.Push(i * 10);
    cout << "  Top = " << ls.Top() << endl;      // 30
    cout << "  Pop = " << ls.Pop() << endl;      // 30
    cout << "  Pop = " << ls.Pop() << endl;      // 20
    cout << "  Empty = " << ls.Empty() << endl;  // 0
    cout << endl;

    // ---------- 3. 括号匹配 ----------
    cout << "【3. 括号匹配】" << endl;
    string tests[] = {
        "((()))", "([{}])", "(()", "([)]", "", "a(b)c[d]"
    };
    for (const string& t : tests) {
        cout << "  \"" << t << "\" → "
             << (checkBrackets(t) ? "匹配 ✓" : "不匹配 ✗") << endl;
    }
    cout << endl;

    // ---------- 4. 十进制转二进制 ----------
    cout << "【4. 十进制转二进制（栈的经典应用）】" << endl;
    for (int n : {5, 10, 255, 1000}) {
        cout << "  " << n << " → " << toBinary(n) << endl;
    }
    cout << endl;

    // ---------- 5. 逆波兰表达式 ----------
    cout << "【5. 逆波兰表达式求值】" << endl;
    cout << "  \"3 4 +\"       = " << evalRPN("3 4 +") << "   (3+4)" << endl;
    cout << "  \"3 4 + 2 *\"   = " << evalRPN("3 4 + 2 *") << "  ((3+4)*2)" << endl;
    cout << "  \"5 1 2 + 4 * -\" = " << evalRPN("5 1 2 + 4 * -") << " (5-(1+2)*4)" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  栈的核心：后进先出（LIFO）" << endl;
    cout << "  所有操作都是 O(1)" << endl;
    cout << "========================================" << endl;

    return 0;
}
