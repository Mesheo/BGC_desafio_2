import "./App.css";
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  let handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res = await fetch("https://v11cbhjj4e.execute-api.sa-east-1.amazonaws.com/dev/send_message", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          crush_name: name,
          crush_email: email,
          message: message,
        }),
      });
      let resJson = await res.json();
      if (res.status === 200) {
        setName("");
        setEmail("");
        setMessage("");
        setStatus("Email enviado com sucesso!");
      } else {
        setStatus("Algo deu errado :C");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (

    <div className="App">
      <h1>Digite suas próprias informações para testar! </h1>
      <br></br>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          placeholder="Nome"
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          value={message}
          placeholder="Menssagem"
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="submit">Enviar</button>

        <div className="message">{status ? <p>{status}</p> : null}</div>

      </form>
    </div>
  );
}

export default App;
