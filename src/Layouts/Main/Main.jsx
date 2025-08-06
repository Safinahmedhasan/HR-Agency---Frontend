import { Outlet } from "react-router-dom";
import Navbar from "../../components/Users/Navbar/Navbar";
import Footer from "../../components/Users/Footer/Footer";

const Main = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Main;
