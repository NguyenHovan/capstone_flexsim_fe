import { BrowserRouter } from "react-router-dom";
import MainRoute from "./routers";
import { Toaster } from "sonner";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <BrowserRouter>
        <MainRoute />
      </BrowserRouter>
    </>
  );
}

export default App;

// import { HashRouter } from "react-router-dom";
// import MainRoute from "./routers";
// import { Toaster } from "sonner";

// function App() {
//   return (
//     <>
//       <Toaster position="top-right" />
//       <HashRouter>
//         <MainRoute />
//       </HashRouter>
//     </>
//   );
// }

// export default App;
