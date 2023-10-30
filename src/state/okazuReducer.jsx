const initalStateDummy = {
  test: ["とんかつ", "焼売", "肉豆腐"],
  // id,name,prie
  okazu_selected: [],
  // id,name,price,sidedisheNames[]
  bento_registered: [],
  // id,name,price,sidedisheNames[]
  bento_purchased: [],
};

const initalState = localStorage.getItem("okazuReducer")
  ? JSON.parse(localStorage.getItem("okazuReducer"))
  : initalStateDummy;

function dataSave(stat) {
  localStorage.setItem("okazuReducer", JSON.stringify(stat));
}

const okazuReducer = (state = initalState, action) => {
  console.log("ステータス");
  console.log(state);
  let stat;
  switch (action.type) {
    case "test":
      console.log("初回起動");
      stat = state;
      dataSave(stat);
      break;

    case "okazu-selected":
      console.log("おかず選択");
      // state.okazu_selected.push(action.payload);

      state = {
        ...state,
        okazu_selected: [...state.okazu_selected, action.payload],
      };
      stat = state;
      dataSave(stat);
      break;

    case "bento-registered":
      console.log("弁当登録");
      // state.bento_registered.push(action.payload);
      // state.okazu_selected = [];
      state = {
        ...state,
        bento_registered: [...state.bento_registered, action.payload],
        okazu_selected: [],
      };

      stat = state;
      dataSave(stat);
      break;

    // 登録された弁当のリストをコピー
    case "bento-purchased":
      console.log("弁当リストコピー");
      // 今までの購入弁当情報に今回の購入弁当情報を追加
      // state.bento_purchased = [
      //   ...state.bento_purchased,
      //   ...state.bento_registered,
      // ];

      state = {
        ...state,
        bento_purchased: [...state.bento_purchased, ...state.bento_registered],
        okazu_selected: [],
      };
      stat = state;
      dataSave(stat);
      break;

    case "bento-purchased-clear":
      console.log("登録弁当リストクリア");
      // state.bento_registered = [];

      state = {
        ...state,
        bento_registered: [],
      };
      stat = state;
      dataSave(stat);
      break;

    default:
      console.log("デフォルト");
      stat = state;
      break;
  }
  console.log("中間保存");
  console.log(stat);

  return stat;
};

export default okazuReducer;
