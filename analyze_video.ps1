Add-Type -AssemblyName System.Drawing
$videoPath = "D:\paris-example-video.mp4"
$shell = New-Object -ComObject Shell.Application
$folder = Split-Path $videoPath
$file = Get-Item $videoPath

# Extract thumbnail using Windows shell
$shellFolder = $shell.Namespace($folder)
$shellFile = $shellFolder.ParseName($file.Name)
$thumbnail = $shellFolder.GetDetailsOf($shellFile, 1)

Write-Output "Video: $($file.Name)"
Write-Output "Size: $($file.Length) bytes"
Write-Output "Thumbnail info: $thumbnail"

# Use ffmpeg to analyze frames
$ffmpeg = "C:\Users\丁文杰\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
$ffprobe = "C:\Users\丁文杰\AppData\Local\Microsoft\WinGet\Links\ffprobe.exe"

# Extract frames and dump pixel analysis
& $ffmpeg -y -i $videoPath -ss 3 -frames:v 1 -vf "scale=20:13" -pix_fmt rgb24 -f rawvideo "C:\Users\丁文杰\resort-guide\frame.raw" 2>$null

$bytes = [System.IO.File]::ReadAllBytes("C:\Users\丁文杰\resort-guide\frame.raw")
Write-Output "`nPixel data (20x13, each char = approx color):"
for ($y = 0; $y -lt 13; $y++) {
    $line = ""
    for ($x = 0; $x -lt 20; $x++) {
        $pos = ($y * 20 + $x) * 3
        $r = $bytes[$pos]
        $g = $bytes[$pos + 1]
        $b = $bytes[$pos + 2]
        $brightness = [int](($r + $g + $b) / 3)
        if ($brightness -gt 200) { $ch = "#" }
        elseif ($brightness -gt 150) { $ch = "+" }
        elseif ($brightness -gt 100) { $ch = "." }
        elseif ($brightness -gt 50) { $ch = "-" }
        else { $ch = " " }
        $line += $ch
    }
    Write-Output $line
}
