
import axios from "axios";
export default function Login(){
 async function login(){
  const r = await axios.post("http://localhost:8000/v1/auth/login",{email:"admin@test.com",password:"admin"});
  localStorage.token=r.data.token;location.reload();
 }
 return <button onClick={login}>Login</button>;
}
