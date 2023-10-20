import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import OkazuDetails from "./OkazuDetails";
import OkazuHeader from "./OkazuHeader";
import OkazuIndex from "./OkazuIndex";

// 永続のため
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./state/StateManager";

export default function ViewManager() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <OkazuHeader />
            <Routes>
              <Route path="/" element={<OkazuIndex />} />
              <Route path="/okazu/:okazuId" element={<OkazuDetails />} />
            </Routes>
          </Router>
        </PersistGate>
      </Provider>
    </>
  );
}
