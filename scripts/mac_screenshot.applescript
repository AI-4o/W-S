-- Definisci il percorso dove salvare lo screenshot
set screenshotPath to (POSIX path of (path to home folder)) & "dev-test/hacking/langchain/screenshots/"

-- Crea la cartella se non esiste
do shell script "mkdir -p " & quoted form of screenshotPath

-- Definisci il nome del file con data e ora per evitare sovrascritture
set timeStamp to do shell script "date +%Y-%m-%d_%H-%M-%S"
set fileName to "screenshot_" & timeStamp & ".png"

-- Comando per catturare lo screenshot dell'intero schermo
do shell script "screencapture -x " & quoted form of (screenshotPath & fileName)

-- ritorna il path del file
return screenshotPath & fileName