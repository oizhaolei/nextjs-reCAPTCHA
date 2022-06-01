import React, { useState, FC, useCallback, useEffect } from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
  GoogleReCaptcha,
} from "react-google-recaptcha-v3";

const ReComponent = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  const clickHandler = useCallback(async () => {
    if (!executeRecaptcha) {
      return;
    }

    const result = await executeRecaptcha("homepage");

    console.log("result:", result);
    setToken(result);

    await onReCAPTCHAChange(result);
  }, [email, executeRecaptcha]);

  const handleTextChange = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const onReCAPTCHAChange = async (result) => {
    console.log("onReCAPTCHAChange:", result);
    if (!result) {
      return;
    }
    try {
      const body = JSON.stringify({ email, captcha: result });
      console.log("req.body:", body);
      const response = await fetch("/api/register", {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("response:", await response.text());
      if (response.ok) {
        // If the response is ok than show the success alert
        alert("Email registered successfully");
      } else {
        // Else throw an error with the message returned
        // from the API
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      alert(error?.message || "Something went wrong");
    } finally {
      // Reset the reCAPTCHA when the request has failed or succeeeded
      // so that it can be executed again if user submits another email.
      setEmail("");
    }
  };

  useEffect(() => {
    if (!executeRecaptcha || !email) {
      return;
    }

    const handleReCaptchaVerify = async () => {
      const token = await executeRecaptcha("homepage");
      setToken(token);
    };

    handleReCaptchaVerify();
  }, [executeRecaptcha, email]);

  return (
    <div>
      <div>
        <input
          required
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleTextChange}
          value={email}
        />
      </div>
      <br />
      <button onClick={clickHandler}>Register</button>
      <br />
      {token && <p>Token: {token}</p>}
    </div>
  );
};

const App = () => {
  return (
    <GoogleReCaptchaProvider
      language="es-AR"
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
    >
      <ReComponent />
    </GoogleReCaptchaProvider>
  );
};

export default App;
