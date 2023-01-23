<script lang="ts">
import CryptoJS from "crypto-js";

let message = '';
let password = '';
// Encrypt

let encrypted = '';

let decrypted = '';
let toDecrypt = '';

$: {
  encrypted = CryptoJS.AES.encrypt(message, password).toString();
  try {
    let toDecryptBytes = CryptoJS.AES.decrypt(toDecrypt, password);
    decrypted = toDecryptBytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    decrypted = encrypted;
  }
}

</script>

Password
<input bind:value={password} />
Input
<textarea bind:value={message} />

Encrypted
<textarea bind:value={encrypted} />

To decrypt
<textarea bind:value={toDecrypt} />

Output
<textarea bind:value={decrypted} />