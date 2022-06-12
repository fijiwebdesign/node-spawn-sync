command=$*

pipe_code="/tmp/process-pipe-code-$$"
mkfifo -m 600 "$pipe_code"

pipe_out="/tmp/process-pipe-out-$$"
mkfifo -m 600 "$pipe_out"

out=$($command 2>&1)

code=$? # return code from $command

echo $code > $pipe_code

echo $out > $pipe_out