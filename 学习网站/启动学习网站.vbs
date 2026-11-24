Option Explicit

Dim fso, shell, baseDir, serverPy, buildPy, manifestJs, indexHtml
Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

baseDir = fso.GetParentFolderName(WScript.ScriptFullName)
serverPy = fso.BuildPath(baseDir, "server.py")
buildPy = fso.BuildPath(baseDir, "build_content.py")
manifestJs = fso.BuildPath(fso.BuildPath(baseDir, "data"), "manifest.js")
indexHtml = fso.BuildPath(baseDir, "index.html")

shell.CurrentDirectory = baseDir
shell.Environment("Process")("PYTHONUTF8") = "1"

Function TryPython(cmdPrefix)
    Dim rc
    On Error Resume Next
    Err.Clear
    rc = shell.Run(cmdPrefix & " -c ""import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)""", 0, True)
    If Err.Number = 0 And rc = 0 Then
        TryPython = True
    Else
        TryPython = False
    End If
    Err.Clear
    On Error GoTo 0
End Function

Dim pyCmd, candidates, c
candidates = Array("pythonw.exe", "pyw.exe -3", "python.exe", "py.exe -3")
pyCmd = ""
For Each c In candidates
    If TryPython(c) Then
        pyCmd = c
        Exit For
    End If
Next

If pyCmd = "" Then
    Dim ans, msg
    msg = "Python 3 was not found in PATH." & vbCrLf & _
          "Please install Python 3 (with 'Add Python to PATH') to enable local g++ judging." & vbCrLf & vbCrLf & _
          "Open index.html directly in offline browsing mode now?"
    ans = MsgBox(msg, vbYesNo + vbQuestion, "DS-Algorithm Study Site")
    If ans = vbYes And fso.FileExists(indexHtml) Then
        shell.Run """" & indexHtml & """", 1, False
    End If
    WScript.Quit 1
End If

If (Not fso.FileExists(manifestJs)) And fso.FileExists(buildPy) Then
    shell.Run pyCmd & " """ & buildPy & """", 0, True
End If

Dim extraArgs, i, arg
extraArgs = ""
For i = 0 To WScript.Arguments.Count - 1
    arg = WScript.Arguments(i)
    If InStr(arg, " ") > 0 Then
        extraArgs = extraArgs & " """ & arg & """"
    Else
        extraArgs = extraArgs & " " & arg
    End If
Next

shell.Run pyCmd & " """ & serverPy & """ --background" & extraArgs, 0, False
WScript.Quit 0
