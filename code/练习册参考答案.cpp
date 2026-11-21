// ============================================================
// 练习册参考答案.cpp
// 配套笔记：编程练习.md
//
// 本文件收录练习册中所有编程题的参考答案，并对每道题
// 做了自动化测试（用断言验证结果正确）。
//
// 编译运行：
//   g++ -std=c++11 -Wall 练习册参考答案.cpp -o demo && ./demo
//
// 输出末尾会显示 "全部测试通过" 或列出失败项。
// ============================================================

#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <stack>
#include <deque>
#include <unordered_map>
#include <list>
#include <algorithm>
#include <climits>
#include <sstream>
#include <functional>
#include <cassert>
#include <cstdlib>          // getenv（VERBOSE_TEST 模式用）
using namespace std;

// ---------- 测试框架 ----------
int testsPassed = 0;
int testsFailed = 0;

void check(bool condition, const string& testName) {
    if (condition) {
        testsPassed++;
        if (getenv("VERBOSE_TEST")) cout << "    [PASS] " << testName << endl;
    } else {
        testsFailed++;
        cout << "  [FAIL] " << testName << endl;
    }
}

// ============================================================
// 第 2 章 线性表
// ============================================================

// ---------- 2-1 数组去重 ----------
int removeDuplicates(int a[], int n) {
    if (n == 0) return 0;
    int slow = 0;
    for (int fast = 1; fast < n; fast++) {
        if (a[fast] != a[slow]) {
            slow++;
            a[slow] = a[fast];
        }
    }
    return slow + 1;
}

// ---------- 2-2 合并两个有序数组 ----------
void mergeSorted(int a[], int n, int b[], int m, int result[]) {
    int i = 0, j = 0, k = 0;
    while (i < n && j < m) {
        if (a[i] <= b[j]) result[k++] = a[i++];
        else              result[k++] = b[j++];
    }
    while (i < n) result[k++] = a[i++];
    while (j < m) result[k++] = b[j++];
}

// ---------- 2-3 单链表反转 ----------
struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

Node* reverseList(Node* head) {
    Node* prev = nullptr;
    Node* cur = head;
    while (cur != nullptr) {
        Node* next = cur->next;
        cur->next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}

// ---------- 2-4 找中间节点 ----------
Node* findMiddle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}

// ---------- 2-5 判断链表有环 ----------
bool hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;
    }
    return false;
}

// ---------- 2-6 删除倒数第 k 个节点 ----------
Node* removeKthFromEnd(Node* head, int k) {
    Node* dummy = new Node(0);
    dummy->next = head;

    Node* fast = dummy;
    Node* slow = dummy;

    for (int i = 0; i <= k; i++) {
        if (fast == nullptr) { delete dummy; return head; }
        fast = fast->next;
    }

    while (fast != nullptr) {
        slow = slow->next;
        fast = fast->next;
    }

    Node* toDelete = slow->next;
    if (toDelete) {
        slow->next = toDelete->next;
        delete toDelete;
    }
    Node* result = dummy->next;
    delete dummy;
    return result;
}

// ---------- 2-7 两个链表的交点 ----------
Node* getIntersection(Node* headA, Node* headB) {
    if (!headA || !headB) return nullptr;
    Node* p = headA;
    Node* q = headB;
    while (p != q) {
        p = (p == nullptr) ? headB : p->next;
        q = (q == nullptr) ? headA : q->next;
    }
    return p;
}

// ============================================================
// 第 3 章 栈与队列
// ============================================================

// ---------- 3-1 有效的括号 ----------
bool isValid(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{')) return false;
            st.pop();
        }
    }
    return st.empty();
}

// ---------- 3-2 用栈实现队列 ----------
class MyQueue {
    stack<int> inStack, outStack;
    void transfer() {
        while (!inStack.empty()) {
            outStack.push(inStack.top());
            inStack.pop();
        }
    }
public:
    void push(int x) { inStack.push(x); }
    int pop() {
        if (outStack.empty()) transfer();
        int x = outStack.top(); outStack.pop();
        return x;
    }
    int peek() {
        if (outStack.empty()) transfer();
        return outStack.top();
    }
    bool empty() { return inStack.empty() && outStack.empty(); }
};

// ---------- 3-3 最小栈 ----------
class MinStack {
    stack<int> dataStack, minStack;
public:
    void push(int x) {
        dataStack.push(x);
        if (minStack.empty() || x <= minStack.top()) minStack.push(x);
    }
    void pop() {
        if (dataStack.top() == minStack.top()) minStack.pop();
        dataStack.pop();
    }
    int top() { return dataStack.top(); }
    int getMin() { return minStack.top(); }
};

// ---------- 3-4 逆波兰表达式求值 ----------
int evalRPN(vector<string>& tokens) {
    stack<int> st;
    for (const string& t : tokens) {
        if (t == "+" || t == "-" || t == "*" || t == "/") {
            int b = st.top(); st.pop();
            int a = st.top(); st.pop();
            int r = 0;
            if (t == "+") r = a + b;
            else if (t == "-") r = a - b;
            else if (t == "*") r = a * b;
            else r = a / b;
            st.push(r);
        } else {
            st.push(stoi(t));
        }
    }
    return st.top();
}

// ---------- 3-5 滑动窗口最大值 ----------
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq;
    vector<int> result;
    for (int i = 0; i < (int)nums.size(); i++) {
        if (!dq.empty() && dq.front() <= i - k) dq.pop_front();
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(nums[dq.front()]);
    }
    return result;
}

// ---------- 3-7 循环双端队列 ----------
class MyCircularDeque {
    vector<int> data;
    int front, rear, capacity;
public:
    MyCircularDeque(int k) : data(k + 1), front(0), rear(0), capacity(k + 1) {}
    bool isEmpty() { return front == rear; }
    bool isFull() { return (rear + 1) % capacity == front; }
    bool insertFront(int value) {
        if (isFull()) return false;
        front = (front - 1 + capacity) % capacity;
        data[front] = value;
        return true;
    }
    bool insertLast(int value) {
        if (isFull()) return false;
        data[rear] = value;
        rear = (rear + 1) % capacity;
        return true;
    }
    bool deleteFront() {
        if (isEmpty()) return false;
        front = (front + 1) % capacity;
        return true;
    }
    bool deleteLast() {
        if (isEmpty()) return false;
        rear = (rear - 1 + capacity) % capacity;
        return true;
    }
    int getFront() { return isEmpty() ? -1 : data[front]; }
    int getRear() { return isEmpty() ? -1 : data[(rear - 1 + capacity) % capacity]; }
};

// ============================================================
// 第 4 章 树
// ============================================================
struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// ---------- 4-1 最大深度 ----------
int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}

// ---------- 4-2 判断平衡二叉树 ----------
int checkHeight(TreeNode* node) {
    if (!node) return 0;
    int lh = checkHeight(node->left);
    if (lh == -1) return -1;
    int rh = checkHeight(node->right);
    if (rh == -1) return -1;
    if (abs(lh - rh) > 1) return -1;
    return 1 + max(lh, rh);
}
bool isBalanced(TreeNode* root) { return checkHeight(root) != -1; }

// ---------- 4-3 层序遍历 ----------
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> result;
    if (!root) return result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int levelSize = q.size();
        vector<int> level;
        for (int i = 0; i < levelSize; i++) {
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left)  q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(level);
    }
    return result;
}

// ---------- 4-4 最近公共祖先 ----------
TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
    if (!root || root == p || root == q) return root;
    TreeNode* left  = lowestCommonAncestor(root->left, p, q);
    TreeNode* right = lowestCommonAncestor(root->right, p, q);
    if (left && right) return root;
    return left ? left : right;
}

// ---------- 4-5 验证 BST ----------
bool validate(TreeNode* node, long long low, long long high) {
    if (!node) return true;
    if (node->val <= low || node->val >= high) return false;
    return validate(node->left, low, node->val) &&
           validate(node->right, node->val, high);
}
bool isValidBST(TreeNode* root) { return validate(root, LLONG_MIN, LLONG_MAX); }

// ---------- 4-6 二叉树直径 ----------
int diameterOfBinaryTree(TreeNode* root) {
    int maxDiameter = 0;
    function<int(TreeNode*)> depth = [&](TreeNode* node) -> int {
        if (!node) return 0;
        int l = depth(node->left);
        int r = depth(node->right);
        maxDiameter = max(maxDiameter, l + r);
        return 1 + max(l, r);
    };
    depth(root);
    return maxDiameter;
}

// ---------- 4-7 序列化/反序列化 ----------
string serialize(TreeNode* root) {
    if (!root) return "#";
    return to_string(root->val) + "," + serialize(root->left) + "," + serialize(root->right);
}
TreeNode* buildTree(queue<string>& tokens) {
    string val = tokens.front(); tokens.pop();
    if (val == "#") return nullptr;
    TreeNode* node = new TreeNode(stoi(val));
    node->left  = buildTree(tokens);
    node->right = buildTree(tokens);
    return node;
}
TreeNode* deserialize(const string& data) {
    queue<string> tokens;
    stringstream ss(data);
    string token;
    while (getline(ss, token, ',')) tokens.push(token);
    return buildTree(tokens);
}

// ============================================================
// 第 5 章 图
// ============================================================

// ---------- 5-1 岛屿数量 ----------
void sink(vector<vector<char>>& grid, int i, int j) {
    int m = grid.size(), n = grid[0].size();
    if (i < 0 || i >= m || j < 0 || j >= n || grid[i][j] != '1') return;
    grid[i][j] = '0';
    sink(grid, i + 1, j);
    sink(grid, i - 1, j);
    sink(grid, i, j + 1);
    sink(grid, i, j - 1);
}
int numIslands(vector<vector<char>>& grid) {
    if (grid.empty()) return 0;
    int count = 0;
    for (int i = 0; i < (int)grid.size(); i++)
        for (int j = 0; j < (int)grid[0].size(); j++)
            if (grid[i][j] == '1') { count++; sink(grid, i, j); }
    return count;
}

// ---------- 5-2 腐烂的橘子 ----------
int orangesRotting(vector<vector<int>>& grid) {
    int m = grid.size(), n = grid[0].size();
    queue<pair<int,int>> q;
    int fresh = 0;
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            if (grid[i][j] == 1) fresh++;
            else if (grid[i][j] == 2) q.push({i, j});
        }
    if (fresh == 0) return 0;
    int minutes = 0;
    int dirs[4][2] = {{1,0},{-1,0},{0,1},{0,-1}};
    while (!q.empty() && fresh > 0) {
        int size = q.size();
        minutes++;
        for (int k = 0; k < size; k++) {
            int x = q.front().first, y = q.front().second; q.pop();
            for (auto& d : dirs) {
                int nx = x + d[0], ny = y + d[1];
                if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue;
                if (grid[nx][ny] != 1) continue;
                grid[nx][ny] = 2;
                fresh--;
                q.push({nx, ny});
            }
        }
    }
    return fresh == 0 ? minutes : -1;
}

// ---------- 5-3 课程表 ----------
bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
    vector<vector<int>> adj(numCourses);
    vector<int> indegree(numCourses, 0);
    for (auto& p : prerequisites) {
        adj[p[1]].push_back(p[0]);
        indegree[p[0]]++;
    }
    queue<int> q;
    for (int i = 0; i < numCourses; i++)
        if (indegree[i] == 0) q.push(i);
    int finished = 0;
    while (!q.empty()) {
        int cur = q.front(); q.pop();
        finished++;
        for (int next : adj[cur])
            if (--indegree[next] == 0) q.push(next);
    }
    return finished == numCourses;
}

// ---------- 5-5 网络延迟时间 ----------
int networkDelayTime(vector<vector<int>>& times, int n, int k) {
    const int INF = 1e9;
    vector<vector<pair<int,int>>> graph(n + 1);
    for (auto& t : times) graph[t[0]].push_back({t[1], t[2]});
    vector<int> dist(n + 1, INF);
    dist[k] = 0;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    pq.push({0, k});
    while (!pq.empty()) {
        int d = pq.top().first, u = pq.top().second; pq.pop();
        if (d > dist[u]) continue;
        for (size_t gi = 0; gi < graph[u].size(); gi++) {
            int v = graph[u][gi].first, w = graph[u][gi].second;
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
    int answer = 0;
    for (int i = 1; i <= n; i++) {
        if (dist[i] == INF) return -1;
        answer = max(answer, dist[i]);
    }
    return answer;
}

// ---------- 5-6 判断二分图 ----------
bool isBipartite(vector<vector<int>>& graph) {
    int n = graph.size();
    vector<int> color(n, -1);
    for (int start = 0; start < n; start++) {
        if (color[start] != -1) continue;
        queue<int> q;
        q.push(start);
        color[start] = 0;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            for (int v : graph[u]) {
                if (color[v] == -1) { color[v] = 1 - color[u]; q.push(v); }
                else if (color[v] == color[u]) return false;
            }
        }
    }
    return true;
}

// ============================================================
// 第 6 章 查找
// ============================================================

// ---------- 6-1 搜索插入位置 ----------
int searchInsert(vector<int>& nums, int target) {
    int low = 0, high = nums.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return low;
}

// ---------- 6-2 查找第一个和最后一个位置 ----------
vector<int> searchRange(vector<int>& nums, int target) {
    auto lowerBound = [&](int t) {
        int low = 0, high = nums.size();
        while (low < high) {
            int mid = low + (high - low) / 2;
            if (nums[mid] < t) low = mid + 1;
            else high = mid;
        }
        return low;
    };
    int left = lowerBound(target);
    int right = lowerBound(target + 1) - 1;
    if (left < (int)nums.size() && nums[left] == target) return {left, right};
    return {-1, -1};
}

// ---------- 6-3 旋转数组最小值 ----------
int findMin(vector<int>& nums) {
    int low = 0, high = nums.size() - 1;
    while (low < high) {
        int mid = low + (high - low) / 2;
        if (nums[mid] > nums[high]) low = mid + 1;
        else high = mid;
    }
    return nums[low];
}

// ---------- 6-4 简单哈希表 ----------
class MyHashMap {
    static const int BUCKET_COUNT = 1009;
    vector<list<pair<int,int>>> buckets;
    int hash(int key) { return key % BUCKET_COUNT; }
public:
    MyHashMap() : buckets(BUCKET_COUNT) {}
    void put(int key, int value) {
        int idx = hash(key);
        for (auto& kv : buckets[idx])
            if (kv.first == key) { kv.second = value; return; }
        buckets[idx].push_back({key, value});
    }
    int get(int key) {
        int idx = hash(key);
        for (auto& kv : buckets[idx])
            if (kv.first == key) return kv.second;
        return -1;
    }
    void remove(int key) {
        int idx = hash(key);
        for (auto it = buckets[idx].begin(); it != buckets[idx].end(); ++it)
            if (it->first == key) { buckets[idx].erase(it); return; }
    }
};

// ---------- 6-5 前 K 个高频元素 ----------
vector<int> topKFrequent(vector<int>& nums, int k) {
    unordered_map<int, int> freq;
    for (int x : nums) freq[x]++;
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
    for (auto& kv : freq) {
        pq.push({kv.second, kv.first});
        if ((int)pq.size() > k) pq.pop();
    }
    vector<int> result;
    while (!pq.empty()) { result.push_back(pq.top().second); pq.pop(); }
    return result;
}

// ============================================================
// 第 7 章 排序
// ============================================================

// ---------- 7-1 按奇偶排序 ----------
vector<int> sortArrayByParity(vector<int>& nums) {
    int left = 0, right = nums.size() - 1;
    while (left < right) {
        while (left < right && nums[left] % 2 == 0) left++;
        while (left < right && nums[right] % 2 == 1) right--;
        if (left < right) swap(nums[left], nums[right]);
    }
    return nums;
}

// ---------- 7-2 颜色分类 ----------
void sortColors(vector<int>& nums) {
    int low = 0, high = nums.size() - 1, i = 0;
    while (i <= high) {
        if (nums[i] == 0) { swap(nums[i], nums[low]); low++; i++; }
        else if (nums[i] == 2) { swap(nums[i], nums[high]); high--; }
        else i++;
    }
}

// ---------- 7-3 第 K 个最大元素 ----------
int findKthLargest(vector<int>& nums, int k) {
    int target = nums.size() - k;
    int low = 0, high = nums.size() - 1;
    while (true) {
        int pivot = nums[low];
        int i = low, j = high;
        while (i < j) {
            while (i < j && nums[j] >= pivot) j--;
            nums[i] = nums[j];
            while (i < j && nums[i] <= pivot) i++;
            nums[j] = nums[i];
        }
        nums[i] = pivot;
        if (i == target) return nums[i];
        else if (i < target) low = i + 1;
        else high = i - 1;
    }
}

// ---------- 7-4 合并区间 ----------
vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {
    if (intervals.empty()) return {};
    sort(intervals.begin(), intervals.end(),
         [](const vector<int>& a, const vector<int>& b) { return a[0] < b[0]; });
    vector<vector<int>> result;
    result.push_back(intervals[0]);
    for (int i = 1; i < (int)intervals.size(); i++) {
        if (intervals[i][0] <= result.back()[1])
            result.back()[1] = max(result.back()[1], intervals[i][1]);
        else
            result.push_back(intervals[i]);
    }
    return result;
}

// ---------- 7-5 最大数 ----------
string largestNumber(vector<int>& nums) {
    vector<string> strs;
    for (int x : nums) strs.push_back(to_string(x));
    sort(strs.begin(), strs.end(), [](const string& a, const string& b) {
        return a + b > b + a;
    });
    if (strs[0] == "0") return "0";
    string result;
    for (const string& s : strs) result += s;
    return result;
}

// ---------- 7-6 归并排序 ----------
void mergeArr(vector<int>& a, int low, int mid, int high, vector<int>& temp) {
    int i = low, j = mid + 1, k = low;
    while (i <= mid && j <= high) {
        if (a[i] <= a[j]) temp[k++] = a[i++];
        else              temp[k++] = a[j++];
    }
    while (i <= mid)  temp[k++] = a[i++];
    while (j <= high) temp[k++] = a[j++];
    for (int t = low; t <= high; t++) a[t] = temp[t];
}
void mergeSortRec(vector<int>& a, int low, int high, vector<int>& temp) {
    if (low >= high) return;
    int mid = low + (high - low) / 2;
    mergeSortRec(a, low, mid, temp);
    mergeSortRec(a, mid + 1, high, temp);
    mergeArr(a, low, mid, high, temp);
}
void mergeSort(vector<int>& a) {
    vector<int> temp(a.size());
    if (!a.empty()) mergeSortRec(a, 0, a.size() - 1, temp);
}

// ---------- 7-7 快速排序 ----------
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
void quickSortRec(vector<int>& a, int low, int high) {
    if (low >= high) return;
    int pos = partition(a, low, high);
    quickSortRec(a, low, pos - 1);
    quickSortRec(a, pos + 1, high);
}
void quickSort(vector<int>& a) {
    if (!a.empty()) quickSortRec(a, 0, a.size() - 1);
}

// ============================================================
// 测试用例
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  练习册参考答案 —— 自动化测试" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 第 2 章 ----------
    cout << "【第 2 章 线性表】" << endl;
    {
        int a[] = {1,1,2,2,3};
        int len = removeDuplicates(a, 5);
        check(len == 3 && a[0]==1 && a[1]==2 && a[2]==3, "2-1 数组去重");
    }
    {
        int a[] = {1,3,5}, b[] = {2,4,6}, r[6];
        mergeSorted(a,3,b,3,r);
        int expect[] = {1,2,3,4,5,6};
        check(equal(r, r+6, expect), "2-2 合并有序数组");
    }
    {
        Node* h = new Node(1); h->next = new Node(2); h->next->next = new Node(3);
        h = reverseList(h);
        check(h->val==3 && h->next->val==2 && h->next->next->val==1, "2-3 链表反转");
        while (h) { Node* t = h; h = h->next; delete t; }
    }
    {
        Node* h = new Node(1); h->next = new Node(2); h->next->next = new Node(3);
        h->next->next->next = new Node(4); h->next->next->next->next = new Node(5);
        check(findMiddle(h)->val == 3, "2-4 找中间节点");
        while (h) { Node* t = h; h = h->next; delete t; }
    }
    {
        Node* h = new Node(1); h->next = new Node(2); h->next->next = new Node(3);
        check(!hasCycle(h), "2-5 无环检测");
        h->next->next->next = h->next;   // 制造环
        check(hasCycle(h), "2-5 有环检测");
        h->next->next->next = nullptr;
        while (h) { Node* t = h; h = h->next; delete t; }
    }
    {
        Node* h = new Node(1); h->next = new Node(2); h->next->next = new Node(3);
        h->next->next->next = new Node(4); h->next->next->next->next = new Node(5);
        h = removeKthFromEnd(h, 2);   // 删倒数第2个（4）
        check(h->val==1 && h->next->val==2 && h->next->next->val==3
              && h->next->next->next->val==5, "2-6 删除倒数第k个");
        while (h) { Node* t = h; h = h->next; delete t; }
    }
    {
        // A: 1->2->3->4, B: 5->3->4（交点在 3）
        Node* common = new Node(3);
        common->next = new Node(4);
        Node* a = new Node(1); a->next = new Node(2); a->next->next = common;
        Node* b = new Node(5); b->next = common;
        check(getIntersection(a,b) == common, "2-7 链表交点");
        delete a->next; delete a; delete b; delete common->next; delete common;
    }
    cout << endl;

    // ---------- 第 3 章 ----------
    cout << "【第 3 章 栈与队列】" << endl;
    check(isValid("()[]{}") && isValid("([{}])") && !isValid("([)]")
          && !isValid("((") && !isValid(")"), "3-1 有效括号");
    {
        MyQueue q;
        q.push(1); q.push(2); q.push(3);
        check(q.peek()==1 && q.pop()==1 && q.pop()==2 && !q.empty()
              && q.pop()==3 && q.empty(), "3-2 用栈实现队列");
    }
    {
        MinStack ms;
        ms.push(3); ms.push(1); ms.push(2);
        check(ms.getMin()==1, "3-3 最小栈 getMin");
        ms.pop(); ms.pop();
        check(ms.getMin()==3 && ms.top()==3, "3-3 最小栈 弹栈后");
    }
    {
        vector<string> t1 = {"3","4","+","2","*"};
        vector<string> t2 = {"5","1","2","+","4","*","-"};
        check(evalRPN(t1)==14, "3-4 逆波兰 (3+4)*2");
        check(evalRPN(t2)==-7, "3-4 逆波兰 5-(1+2)*4");
    }
    {
        vector<int> v = {1,3,-1,-3,5,3,6,7};
        auto r = maxSlidingWindow(v, 3);
        vector<int> e = {3,3,5,5,6,7};
        check(r == e, "3-5 滑动窗口最大值");
    }
    {
        MyCircularDeque dq(3);
        check(dq.insertLast(1) && dq.insertLast(2) && dq.insertFront(3)
              && dq.getRear()==2 && dq.isFull() && dq.deleteLast()
              && dq.insertFront(4) && dq.getFront()==4, "3-7 循环双端队列");
    }
    cout << endl;

    // ---------- 第 4 章 ----------
    cout << "【第 4 章 树】" << endl;
    {
        //       1
        //      / ＼
        //     2   3
        //    /
        //   4
        TreeNode* r = new TreeNode(1);
        r->left = new TreeNode(2); r->right = new TreeNode(3);
        r->left->left = new TreeNode(4);
        check(maxDepth(r) == 3, "4-1 最大深度");
        check(isBalanced(r), "4-2 平衡二叉树");
        auto lo = levelOrder(r);
        check(lo.size()==3 && lo[0][0]==1 && lo[1].size()==2 && lo[2][0]==4,
              "4-3 层序遍历");
        check(lowestCommonAncestor(r, r->left, r->right) == r, "4-4 LCA(2,3)=1");
        check(lowestCommonAncestor(r, r->left, r->left->left) == r->left,
              "4-4 LCA(2,4)=2");
        check(diameterOfBinaryTree(r) == 3, "4-6 二叉树直径");

        string s = serialize(r);
        TreeNode* r2 = deserialize(s);
        check(serialize(r2) == s, "4-7 序列化往返一致");
    }
    {
        // 合法 BST
        TreeNode* b = new TreeNode(2);
        b->left = new TreeNode(1); b->right = new TreeNode(3);
        check(isValidBST(b), "4-5 合法BST");
    }
    {
        // 非法 BST：5 的右子树里有个 3（<5）
        TreeNode* b = new TreeNode(5);
        b->left = new TreeNode(1); b->right = new TreeNode(4);
        b->right->left = new TreeNode(3); b->right->right = new TreeNode(6);
        check(!isValidBST(b), "4-5 非法BST（经典陷阱）");
    }
    cout << endl;

    // ---------- 第 5 章 ----------
    cout << "【第 5 章 图】" << endl;
    {
        vector<vector<char>> g = {
            {'1','1','0','0','0'},
            {'1','1','0','0','0'},
            {'0','0','1','0','0'},
            {'0','0','0','1','1'}
        };
        check(numIslands(g) == 3, "5-1 岛屿数量");
    }
    {
        vector<vector<int>> g = {
            {2,1,1},
            {1,1,0},
            {0,1,1}
        };
        check(orangesRotting(g) == 4, "5-2 腐烂的橘子");
    }
    {
        vector<vector<int>> p1 = {{1,0}};
        vector<vector<int>> p2 = {{1,0},{0,1}};
        check(canFinish(2,p1) && !canFinish(2,p2), "5-3 课程表（环检测）");
    }
    {
        vector<vector<int>> times = {{2,1,1},{2,3,1},{3,4,1}};
        check(networkDelayTime(times, 4, 2) == 2, "5-5 网络延迟时间");
        vector<vector<int>> t2 = {{1,2,1}};
        check(networkDelayTime(t2, 3, 1) == -1, "5-5 不可达返回-1");
    }
    {
        vector<vector<int>> g1 = {{1,3},{0,2},{1,3},{0,2}};
        vector<vector<int>> g2 = {{1,2,3},{0,2},{0,1,3},{0,2}};
        check(isBipartite(g1) && !isBipartite(g2), "5-6 判断二分图");
    }
    cout << endl;

    // ---------- 第 6 章 ----------
    cout << "【第 6 章 查找】" << endl;
    {
        vector<int> v = {1,3,5,6};
        check(searchInsert(v,5)==2 && searchInsert(v,2)==1
              && searchInsert(v,7)==4, "6-1 搜索插入位置");
    }
    {
        vector<int> v = {5,7,7,8,8,10};
        check(searchRange(v,8) == vector<int>({3,4}), "6-2 查找范围");
        check(searchRange(v,6) == vector<int>({-1,-1}), "6-2 未找到");
    }
    {
        vector<int> v = {4,5,6,7,0,1,2};
        check(findMin(v) == 0, "6-3 旋转数组最小值");
    }
    {
        MyHashMap m;
        m.put(1,10); m.put(2,20); m.put(1009,30);   // 1009 和 0 同桶
        check(m.get(1)==10 && m.get(2)==20 && m.get(1009)==30
              && m.get(999)==-1, "6-4 哈希表 put/get");
        m.put(1,99);
        check(m.get(1)==99, "6-4 哈希表 更新");
        m.remove(2);
        check(m.get(2)==-1, "6-4 哈希表 remove");
    }
    {
        vector<int> v = {1,1,1,2,2,3};
        auto r = topKFrequent(v, 2);
        sort(r.begin(), r.end());
        check(r == vector<int>({1,2}), "6-5 前K个高频元素");
    }
    cout << endl;

    // ---------- 第 7 章 ----------
    cout << "【第 7 章 排序】" << endl;
    {
        vector<int> v = {3,1,2,4};
        auto r = sortArrayByParity(v);
        bool ok = true;
        for (int i = 0; i < 2; i++) if (r[i] % 2 != 0) ok = false;
        for (int i = 2; i < 4; i++) if (r[i] % 2 != 1) ok = false;
        check(ok, "7-1 按奇偶排序");
    }
    {
        vector<int> v = {2,0,2,1,1,0};
        sortColors(v);
        check(v == vector<int>({0,0,1,1,2,2}), "7-2 颜色分类");
    }
    {
        vector<int> v = {3,2,1,5,6,4};
        check(findKthLargest(v,2)==5, "7-3 第K大元素");
    }
    {
        vector<vector<int>> v = {{1,3},{2,6},{8,10},{15,18}};
        auto r = mergeIntervals(v);
        check(r.size()==3 && r[0]==vector<int>({1,6})
              && r[1]==vector<int>({8,10}), "7-4 合并区间");
    }
    {
        vector<int> v1 = {10,2}, v2 = {3,30,34,5,9}, v3 = {0,0};
        check(largestNumber(v1)=="210", "7-5 最大数 [10,2]");
        check(largestNumber(v2)=="9534330", "7-5 最大数 [3,30,34,5,9]");
        check(largestNumber(v3)=="0", "7-5 最大数 全0");
    }
    {
        vector<int> v = {5,2,8,1,9,3,7,4,6};
        vector<int> expect = v;
        sort(expect.begin(), expect.end());
        vector<int> v1 = v; mergeSort(v1);
        vector<int> v2 = v; quickSort(v2);
        check(v1 == expect, "7-6 归并排序");
        check(v2 == expect, "7-7 快速排序");
    }
    cout << endl;

    // ---------- 结果 ----------
    cout << "========================================" << endl;
    cout << "  测试结果：" << endl;
    cout << "    通过 = " << testsPassed << endl;
    cout << "    失败 = " << testsFailed << endl;
    if (testsFailed == 0) {
        cout << "    ✓ 全部测试通过" << endl;
    } else {
        cout << "    ✗ 有测试失败，请检查上面的 FAIL 项" << endl;
    }
    cout << "========================================" << endl;

    return testsFailed == 0 ? 0 : 1;
}
