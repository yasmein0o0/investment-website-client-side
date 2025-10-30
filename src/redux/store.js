import { configureStore } from "@reduxjs/toolkit";
import { injectStore } from "../utils/api";
import userSignup from "./signup"
import userlogin from "./login";
import googleAuth from "./googleAuth"
import verifyemail from "./verifyemail"
import autocomplete from "./autocomplete"
import ticker from "./ticker"
import accessToken from "./refresh"
import logout from "./logout"
import deleteAccount from "./deleteaccount"
import passwordChange from "./passwordChange"
import contact from "./contact"
import movers from "./movers"
import news from "./news"
import calenders from "./calenders"
import qoutes from "./qoutes"
import profile from "./profile"
import earnings from "./earnings"
import incomeStatement from "./incomestatement";
import recommendation from "./recommendation";
import insidertransactions from "./insidertransactions"
export const store = configureStore({
    reducer: {
        signup: userSignup,
        verifyemail,
        login: userlogin,
        googleAuth,
        passwordChange,
        contact,
        autocomplete: autocomplete,
        ticker: ticker,
        accessToken: accessToken,
        logout: logout,
        deleteAccount: deleteAccount,
        movers: movers,
        news: news,
        calenders,
        qoutes,
        profile,
        earnings,
        incomeStatement,
        recommendation,
        insidertransactions
    }
})

injectStore(store); 