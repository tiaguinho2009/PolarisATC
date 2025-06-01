import net from 'net';

console.log('Servidor Node.js iniciado');

process.stdin.setEncoding('utf8');

let tcpClient = null;
let tcpReady = false;

// Função para conectar ao servidor TCP
function connectTCP() {
  if (tcpReady) return;
  tcpClient = net.createConnection({ port: 1130, host: '127.0.0.1' }, () => {
    tcpReady = true;
    process.stdout.write('@status:connected\n');
  });

  tcpClient.setEncoding('ascii');

  tcpClient.on('data', (data) => {
    // Responde ao Rust com a resposta do TCP
    process.stdout.write(data);
  });

  tcpClient.on('end', () => {
    tcpReady = false;
    process.stdout.write('@status:disconnected\n');
  });

  tcpClient.on('error', (err) => {
    tcpReady = false;
    process.stdout.write(`@status:error:${err.message}\n`);
  });
}

// Função para desconectar do servidor TCP
function disconnectTCP() {
  if (tcpClient && tcpReady) {
    tcpClient.end();
    tcpReady = false;
    process.stdout.write('@status:disconnected\n');
  }
}

// Recebe dados do Rust (stdin)
process.stdin.on('data', (data) => {
  const trimmed = data.trim();

  if (trimmed.startsWith('@')) {
    // Comando especial
    if (trimmed === '@connect') {
      connectTCP();
    } else if (trimmed === '@disconnect') {
      disconnectTCP();
    } else if (trimmed === '@status') {
      process.stdout.write(`@status:${tcpReady ? 'connected' : 'disconnected'}\n`);
    } else {
      process.stdout.write('@status:unknown_command\n');
    }
    return;
  }

  // Se não for comando especial, envia para TCP se estiver conectado
  if (tcpReady && tcpClient) {
    tcpClient.write(trimmed + '\n');
  } else {
    process.stdout.write('@status:not_connected\n');
  }
});