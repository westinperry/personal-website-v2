import { createInterface } from 'node:readline/promises';
export async function prompt(label:string) { const rl=createInterface({input:process.stdin,output:process.stderr}); try{return (await rl.question(label)).trim();} finally{rl.close();} }
export async function secret(label:string) {
  if (!process.stdin.isTTY) return prompt(label);
  process.stderr.write(label); process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8');
  return new Promise<string>((resolve,reject)=>{ let value=''; const finish=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off('data',onData);process.stderr.write('\n');resolve(value);};const cancel=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off('data',onData);reject(new Error('Cancelled'));};const onData=(chunk:string)=>{for(const char of chunk){if(char==='\r'||char==='\n'){finish();return;}if(char==='\u0003'){cancel();return;}if(char==='\u007f')value=value.slice(0,-1);else value+=char;}};process.stdin.on('data',onData); });
}
