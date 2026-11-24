Option Explicit

Dim fso, shell, baseDir, pidFile, port, url, stopped
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
pidFile = fso.BuildPath(baseDir, ".server.pid")

port = "8765"
If WScript.Arguments.Count >= 1 Then
    Dim firstArg
    firstArg = Trim(WScript.Arguments(0))
    If IsNumeric(firstArg) Then
        port = firstArg
    End If
End If

url = "http://127.0.0.1:" & port & "/api/shutdown"
stopped = False

Function TryHttpShutdown(targetUrl)
    Dim xhr
    TryHttpShutdown = False
    On Error Resume Next
    Err.Clear
    Set xhr = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    If Err.Number <> 0 Then
        Err.Clear
        Set xhr = CreateObject("MSXML2.XMLHTTP")
    End If
    If Err.Number = 0 And IsObject(xhr) Then
        On Error Resume Next
        xhr.setTimeouts 500, 500, 1000, 1000
        Err.Clear
        xhr.Open "POST", targetUrl, False
        xhr.setRequestHeader "Content-Type", "application/json"
        xhr.Send "{}"
        If Err.Number = 0 And xhr.Status = 200 Then
            TryHttpShutdown = True
        End If
    End If
    Err.Clear
    On Error GoTo 0
End Function

stopped = TryHttpShutdown(url)

If (Not stopped) And fso.FileExists(pidFile) Then
    On Error Resume Next
    Dim ts, pidText, ch, cleanPid, k
    Set ts = fso.OpenTextFile(pidFile, 1, False)
    pidText = Trim(ts.ReadAll)
    ts.Close
    cleanPid = ""
    For k = 1 To Len(pidText)
        ch = Mid(pidText, k, 1)
        If ch >= "0" And ch <= "9" Then
            cleanPid = cleanPid & ch
        Else
            Exit For
        End If
    Next
    If Len(cleanPid) > 0 Then
        shell.Run "taskkill /F /PID " & cleanPid, 0, True
    End If
    fso.DeleteFile pidFile, True
    Err.Clear
    On Error GoTo 0
End If

WScript.Quit 0
