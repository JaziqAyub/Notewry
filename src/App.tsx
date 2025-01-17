import { BrowserRouter, Route, Routes } from "react-router-dom";
// import Button from "./components/atoms/Button";
import Home from "./pages/Home/Home";
// import { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import { UserDataRequest, UserRegister } from "./redux/actions";
// import { AppDispatch } from "./redux/store";
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";


function App() {
  // const dispatch: AppDispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(UserDataRequest());
  // }, [dispatch]);

  // const formData: { [index: string]: string } = {
  //   username: "meowwo",
  //   email: "mewowo@gmail.com",
  //   Password: "1232234",
  // };

  // const handleClick = () => {
  //   dispatch(UserRegister(formData));
  // };

  return (
    <>
      <BrowserRouter>
        {/* <Button
          name="hello"
          clickHandler={handleClick}
          color="red"
          bgColor="blue"
        /> */}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
