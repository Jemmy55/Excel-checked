let modal = bootstrap.Modal.getOrCreateInstance(
  document.getElementById("myModal")
);
const localDataBase = localStorage.getItem("DATA_BASE")
  ? JSON.parse(localStorage.getItem("DATA_BASE"))
  : DataBase;
const localKQDataBase = localStorage.getItem("KQ_DATA_BASE")
  ? JSON.parse(localStorage.getItem("KQ_DATA_BASE"))
  : KQDataBase;
const localKQDataMoney = localStorage.getItem("KQ_DATA_MONEY")
  ? JSON.parse(localStorage.getItem("KQ_DATA_MONEY"))
  : DataMoney;
$(function () {
  $("#myModal").modal({
    backdrop: "static",
    keyboard: false,
  });
  if (localDataBase || localKQDataBase || localKQDataMoney) {
    if (
      (localDataBase &&
        localDataBase[0].LT.saveData[0].SaveDataStorage.length > 0) ||
      (localKQDataBase && localKQDataBase[0].TSHS.length > 0)
    ) {
      modal.show();
      timerDelay(0, 8);
      if (localDataBase) {
        renderTable(localDataBase[0].D, 0);
        timerDelay(1, 8);
        renderTable(localDataBase[0].T, 0);
        timerDelay(2, 8);
        renderTable(localDataBase[0].Truot, 1);
        timerDelay(3, 8);
        renderTable(localDataBase[0].T, 1);
        timerDelay(4, 8);
        renderTable(localDataBase[0].Vang, 2);
        timerDelay(5, 8);
        renderTable(localDataBase[0].T, 2);
        timerDelay(6, 8);
      }
      if (localKQDataBase) {
        renderKQ(localKQDataBase);
        timerDelay(7, 8);
        totalPrice(localKQDataMoney);
        timerDelay(8, 8);
      }
    }
  }
  $(document).on("input", "input:file", function (e) {
    if (e.target.files.length > 0) {
      $(`#name${e.target.id}`).text(e.target.files.length + " Tệp");
    }
    if (e.target.id != "TL") {
      if (e.target.id != "TEST") {
        ReadExcel({ e: e, sheet: 0 });
      }
    } else {
      ReadExcel({ e: e, sheet: 1 });
    }
  });

  $(".CheckValue").click(function () {
    modal.show();
    resetItemLocal();
    timerDelay(0, 10);
    try {
      if (
        DataBase[0].D.saveData[0].SaveDataStorage.length > 0 &&
        DataBase[0].T.saveData[0].SaveDataStorage.length > 0
      ) {
        CheckDat(
          DataBase[0].D.saveData[0].SaveDataStorage,
          DataBase[0].T.saveData[0].SaveDataStorage
        );
        timerDelay(1, 10);
      }
      if (
        (DataBase[0].LT.saveData[1].SaveDataStorage.length > 0 ||
          DataBase[0].MP.saveData[1].SaveDataStorage.length > 0 ||
          DataBase[0].H.saveData[1].SaveDataStorage.length > 0 ||
          DataBase[0].D.saveData[1].SaveDataStorage.length > 0) &&
        DataBase[0].T.saveData[1].SaveDataStorage.length > 0
      ) {
        CheckTruot({
          LT: DataBase[0].LT.saveData[1].SaveDataStorage,
          MP: DataBase[0].MP.saveData[1].SaveDataStorage,
          H: DataBase[0].H.saveData[1].SaveDataStorage,
          D: DataBase[0].D.saveData[1].SaveDataStorage,
          T: DataBase[0].T.saveData[1].SaveDataStorage,
        });
        timerDelay(5, 10);
      }
      if (
        (DataBase[0].LT.saveData[2].SaveDataStorage.length > 0 ||
          DataBase[0].MP.saveData[2].SaveDataStorage.length > 0 ||
          DataBase[0].H.saveData[2].SaveDataStorage.length > 0 ||
          DataBase[0].D.saveData[2].SaveDataStorage.length > 0) &&
        DataBase[0].T.saveData[2].SaveDataStorage.length > 0
      ) {
        findVang();
        CheckVang(
          DataBase[0].Vang.saveData[2].SaveDataStorage,
          DataBase[0].T.saveData[2].SaveDataStorage
        );
        timerDelay(8, 10);
      }

      total();
      setItemLocal();
      timerDelay(10, 10);
    } catch (err) {
      console.log(err);
      timerError();
    }
  });
});

function ReadExcel({ e, sheet }) {
  $(`#${e.target.id}`).change(function () {
    for (var i = 0; i < e.target.files.length; i++) {
      var reader = new FileReader();
      reader.onload = function () {
        var arrayBuffer = this.result;
        var workbook = XLSX.read(arrayBuffer, {
          type: "binary",
        });
        var first_sheet_name = workbook.SheetNames[sheet];
        var worksheet = workbook.Sheets[first_sheet_name];
        var data = XLSX.utils.sheet_to_json(worksheet, {
          raw: true,
        });
        CheckMode ? console.log(data) : "";
        let checked, StringFilter;
        if (e.target.id !== "TL") {
          try {
            DataBase.some((item) => {
              if (e.target.id === item[e.target.id].name) {
                const genderFilter = data.filter((value) => {
                  return item[e.target.id].config.check.some((name) => {
                    if (value[name] !== undefined && isNaN(value[name])) {
                      const toString = value[name];
                      if (toString.includes(item[e.target.id].config.find)) {
                        return value[name];
                      }
                    }
                  });
                });
                item[e.target.id].config.check.forEach((val) => {
                  if (genderFilter[0][val] !== undefined) {
                    StringFilter = genderFilter[0][val];
                    checked = StringFilter.slice(
                      StringFilter.indexOf(
                        item[e.target.id].config.valueChecked
                      ) + item[e.target.id].config.valueChecked.length
                    );
                    CheckMode && console.log(checked);
                  }
                });
              }
              // xử lý đổi tên
              const filter = data.filter((getData) => {
                if (item[e.target.id].change[0].id.length > 1) {
                  return item[e.target.id].change[0].id.some((work) => {
                    return getData[work] > 0 && getData[work] != undefined;
                  });
                } else {
                  return getData[item[e.target.id].change[0].id] > 0;
                }
              });
              // console.log(filter);
              const newData = filter.map((getData) => {
                item[e.target.id].change.map((change) => {
                  renameKeys(getData, change, e.target.id);
                });
                return getData;
              });
              // console.log(newData);
              CheckMode && console.log(newData, checked);
              SaveData(checked, newData, item[e.target.id]);
              AlertSuccess(
                e,
                DataBase[0][[e.target.id]].gender,
                e.target.files.length
              );
            });
            CheckMode && console.log(DataBase);
          } catch (err) {
            // console.log(err);
            AlertError(e, DataBase[0][e.target.id].gender, err);
          }
        } else {
          checkTL(data, e);
          AlertSuccess(
            e,
            DataBase[0][[e.target.id]].gender,
            e.target.files.length
          );
        }
      };
      reader.readAsArrayBuffer(this.files[i]);
    }
  });
}

// Rename Keys on Object
function renameKeys(item, keys, gen) {
  if (keys.id.length >= 2) {
    keys.id.map((work) => {
      if (item[work] !== undefined) {
        if (!isNaN(item[work])) {
          item[keys.value] = item[work];
          delete item[work];
        } else {
          if (item[work].length < 3) {
            if (item[work].includes("A") && keys.value === "DRIVING") {
              item[keys.value] = item[work];
              delete item[work];
            } else if (keys.value === "RANK") {
              item[keys.value] = item[work];
              delete item[work];
            }
          } else if (
            item[work].length > 3 &&
            item[work].length <= 8 &&
            keys.value === "NOT"
          ) {
            item[keys.value] = item[work];
            delete item[work];
          } else if (item[work].length > 8 && keys.value === "CLASS") {
            item[keys.value] = item[work];
            delete item[work];
          }
        }
      }
    });
  } else {
    if (item[keys.id]) {
      item[keys.value] = item[keys.id];
      delete item[keys.id];
    }
  }
  if (gen) {
    item["List"] = `${DataBase[0][gen].gender}`;
  }
  if (item.YEAR) {
    item.YEAR = item.YEAR.replace(/\-/g, "/");
  }
}
// Save Value Data
function SaveData(str, data, e) {
  let StrLength;
  e.saveData.map((item) => {
    if (!item.used) {
      if (str.trim().includes(item.name)) {
        item.SaveDataStorage = data;
        StrLength = item.name;
        item.used = true;
      }
    }
  });
}

// Alert Error Input Data
function AlertError(e, gender, err) {
  const toastLiveExample = document.getElementById("liveToast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  const TitleAlert = $(".alertTitle");
  const BodyTitle = $(".alertBody");
  const Timer = $(".timer");
  $(`#name${e.target.id}`).css({ backgroundColor: "red" });
  TitleAlert.text("Phát hiện lỗi");
  TitleAlert.css({ color: "red", fontSize: "16px" });
  BodyTitle.css({ fontWeight: "bold" });
  const textError = err.message.substr(
    err.message.indexOf("'") + 1,
    err.message.lastIndexOf("'") - err.message.indexOf("'") - 1
  );
  BodyTitle.text(`Tệp ${gender} không đọc được !? Lỗi: ${textError}`);
  Timer.css({ backgroundColor: "red" });
  toastBootstrap.show();
}

// Alert Input Success
function AlertSuccess(e, gender, manyfile) {
  const toastLiveExample = document.getElementById("liveToast");
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample);
  const TitleAlert = $(".alertTitle");
  const BodyTitle = $(".alertBody");
  const Timer = $(".timer");
  TitleAlert.text("Nhập dữ liệu thành công");
  TitleAlert.css({ color: "green", fontSize: "16px" });
  $(".manyFile").text(`${manyfile} tệp`);
  BodyTitle.css({ fontWeight: "bold" });
  Timer.css({ backgroundColor: "green" });
  $(`#name${e.target.id}`).css({ backgroundColor: "green" });
  BodyTitle.text(` ${gender} đã được cập nhật thành công !!`);
  toastBootstrap.show();
}
// TEST TOOL
$("#TEST").change(function () {
  var reader = new FileReader();
  reader.onload = function () {
    var arrayBuffer = this.result;
    var workbook = XLSX.read(arrayBuffer, {
      type: "binary",
    });

    /* DO SOMETHING WITH workbook HERE */
    var first_sheet_name = workbook.SheetNames[0];
    /* Get worksheet */
    var worksheet = workbook.Sheets[first_sheet_name];
    var data = XLSX.utils.sheet_to_json(worksheet, {
      raw: true,
    });
    // }
    // console.log(data);
    // oReq.send();
  };
  reader.readAsArrayBuffer(this.files[0]);
});

// Kiểm tra dữ liệu Đạt
async function CheckDat(D, T) {
  CheckDuplicationNameYear(D);
  CheckDuplicationNameYear(T);
  CheckValue(D, T);
  SwapData(D, T);
  SwapData(T, D);
  CheckList(D, T);
  renderTable(DataBase[0].D, 0);
  renderTable(DataBase[0].T, 0);
}
// Kiểm tra dữ liệu Trượt
async function CheckTruot({ LT, MP, H, D, T }) {
  const Truot = [...LT, ...MP, ...H, ...D];
  CheckDuplicationNameYear(Truot);
  CheckDuplicationNameYear(T);
  CheckValue(Truot, T);
  SwapData(Truot, T);
  SwapData(T, Truot);
  CheckList(Truot, T);
  DataBase[0].Truot.saveData[1].SaveDataStorage = Truot;
  renderTable(DataBase[0].Truot, 1);
  renderTable(DataBase[0].T, 1);
}
async function CheckVang(V, T) {
  CheckDuplicationNameYear(V, T);
  CheckDuplicationNameYear(T, V);
  CheckValue(V, T);
  SwapData(V, T);
  SwapData(T, V);
  CheckList(V, T);
  renderTable(DataBase[0].Vang, 2);
  renderTable(DataBase[0].T, 2);
}

// Kiểm tra tên trùng hoặc tên và ngày tháng trùng
async function CheckDuplicationNameYear(data) {
  data.map((item, index1) => {
    return data.some((value, index2) => {
      if (
        value.NAME === item.NAME &&
        value.YEAR === item.YEAR &&
        index1 != index2
      ) {
        item["DUPLICATION"] = "NAMEYEAR";
      } else if (
        value.NAME === item.NAME &&
        value.YEAR !== item.YEAR &&
        index1 != index2
      ) {
        item["DUPLICATION"] = "NAME";
      }
    });
  });
}
// kiểm tra 2 dữ liệu
function CheckValue(data1, data2) {
  try {
    if (data1 != undefined && data2 !== undefined) {
      if (data1) {
        data1.map((item1) => {
          return !data2.some((val) => {
            FindStudent(item1, val, "CK1");
            // console.log(item1, val);
          });
        });
      }
      if (data2) {
        data2.map((item1) => {
          return !data1.some((val) => {
            FindStudent(item1, val, "CK2");
          });
        });
      }
      if (data1) {
        data1.map((item1) => {
          FindNotHave(item1, "CK");
        });
      }
      if (data2) {
        data2.map((item1) => {
          FindNotHave(item1, "CK");
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
}
function FindStudent(item1, val, type) {
  // console.log(item1, val);
  if (item1[type]) {
    return;
  } else {
    if (val[type]) {
      return;
    } else {
      if (item1.DUPLICATION !== undefined && val.DUPLICATION !== undefined) {
        if (
          item1.NAME.toString().trim().toUpperCase() ===
            val.NAME.toString().trim().toUpperCase() &&
          item1.YEAR.toString().trim().toUpperCase() ===
            val.YEAR.toString().trim().toUpperCase() &&
          item1.RANK.toString().trim().toUpperCase() ===
            val.RANK.toString().trim().toUpperCase()
        ) {
          item1[type] = true;
          val[type] = true;
          item1["CK"] = true;
        } else {
          if (
            item1.NAME.toString().trim().toUpperCase() !==
              val.NAME.toString().trim().toUpperCase() &&
            item1.YEAR.toString().trim().toUpperCase() ===
              val.YEAR.toString().trim().toUpperCase() &&
            item1.RANK.toString().trim().toUpperCase() ===
              val.RANK.toString().trim().toUpperCase()
          ) {
            item1["ERRRONAME"] = true;
            item1[type] = true;
            val[type] = true;
            item1["CK"] = true;
          } else if (
            item1.NAME.toString().trim().toUpperCase() ===
              val.NAME.toString().trim().toUpperCase() &&
            item1.YEAR.toString().trim().toUpperCase() !==
              val.YEAR.toString().trim().toUpperCase() &&
            item1.RANK.toString().trim().toUpperCase() ===
              val.RANK.toString().trim().toUpperCase()
          ) {
            item1["ERRORYEAR"] = true;
            item1[type] = true;
            val[type] = true;
            item1["CK"] = true;
          } else if (
            item1.NAME.toString().trim().toUpperCase() ===
              val.NAME.toString().trim().toUpperCase() &&
            item1.YEAR.toString().trim().toUpperCase() ===
              val.YEAR.toString().trim().toUpperCase() &&
            item1.RANK.toString().trim().toUpperCase() !==
              val.RANK.toString().trim().toUpperCase()
          ) {
            item1["ERRORRANK"] = true;
            item1[type] = true;
            val[type] = true;
            item1["CK"] = true;
          }
        }
      }
    }
    try {
      if (
        item1.NAME.toString().trim().toUpperCase() !==
          val.NAME.toString().trim().toUpperCase() &&
        item1.YEAR.toString().trim().toUpperCase() ===
          val.YEAR.toString().trim().toUpperCase() &&
        item1.RANK.toString().trim().toUpperCase() ===
          val.RANK.toString().trim().toUpperCase()
      ) {
        if (
          item1.NAME.toString()
            .trim()
            .toUpperCase()
            .includes(val.NAME.substr(0, item1.NAME.length))
        ) {
          item1["ERRORNAME"] = true;
          val[type] = true;
          item1["CK"] = true;
        }
      } else if (
        item1.NAME.toString().trim().toUpperCase() ===
          val.NAME.toString().trim().toUpperCase() &&
        item1.YEAR.toString().trim().toUpperCase() !==
          val.YEAR.toString().trim().toUpperCase() &&
        item1.RANK.toString().trim().toUpperCase() ===
          val.RANK.toString().trim().toUpperCase()
      ) {
        item1["ERRORYEAR"] = true;
        val[type] = true;
        item1["CK"] = true;
      } else if (
        item1.NAME.toString().trim().toUpperCase() ===
          val.NAME.toString().trim().toUpperCase() &&
        item1.YEAR.toString().trim().toUpperCase() ===
          val.YEAR.toString().trim().toUpperCase() &&
        item1.RANK.toString().trim().toUpperCase() !==
          val.RANK.toString().trim().toUpperCase()
      ) {
        item1["ERRORRANK"] = true;
        val[type] = true;
        item1["CK"] = true;
      } else if (
        item1.NAME.toString().trim().toUpperCase() ===
          val.NAME.toString().trim().toUpperCase() &&
        item1.YEAR.toString().trim().toUpperCase() ===
          val.YEAR.toString().trim().toUpperCase() &&
        item1.RANK.toString().trim().toUpperCase() ===
          val.RANK.toString().trim().toUpperCase()
      ) {
        item1["CK"] = true;
      }
    } catch (err) {
      console.log(err);
    }
  }
}
async function FindNotHave(data, type) {
  if (!data[type]) {
    data["NOTHAVE"] = true;
  }
}

async function renderTable(data, index) {
  let infoTable = document.querySelector(
    `.info-table-${data.name}-${data.saveData[index].id}`
  );
  // console.log(infoTable);
  infoTable.innerHTML = "";
  let table = document.querySelector(
    `.table-${data.name}-${data.saveData[index].id}`
  );
  table.innerHTML = "";
  const B1 = data.saveData[index].SaveDataStorage.filter(
    (item) => item.RANK === "B1"
  );
  const B2 = data.saveData[index].SaveDataStorage.filter(
    (item) => item.RANK === "B2"
  );
  const C = data.saveData[index].SaveDataStorage.filter(
    (item) => item.RANK === "C"
  );
  // console.log(data.saveData[index].SaveDataStorage);
  if (index === 0) {
    infoTable.innerHTML = `
      <p class="NameList">Danh Sách: <span>${data.gender}</span></p>
      <p class="">Số lượng: <span>Tổng: ${data.saveData[index].SaveDataStorage.length} | B1: ${B1.length} | B2: ${B2.length} | C: ${C.length}</span></p>`;
    data.saveData[index].SaveDataStorage.map((item, index) => {
      table.innerHTML += `
        <tr class="${
          item.DUPLICATION == "NAMEYEAR"
            ? "DUPNAMEYEAR"
            : item.DUPLICATION == "NAME"
            ? "DUPNAME"
            : ""
        } ${item.NOTHAVE ? "NOTHAVE" : ""} ${data.name + index} ${
        index + 1 == B1.length
          ? "br-list"
          : index + 1 == B1.length + B2.length
          ? "br-list"
          : index + 1 == B1.length + B2.length + C.length
          ? "br-list"
          : ""
      }" onclick="showCheckRow(this)" ondblclick="showHideRow('hidden_row_${data.name
        .toString()
        .toLowerCase()}${index + 1}')">
        <th scope="row">${index + 1}</th>
        <td class="${item.ERRORRANK ? "errInfo" : ""}">${item.RANK}</td>
        <td class="${item.ERRORSBD ? "errInfo" : ""}">${
        item.STT != undefined ? item.STT : item.SBD
      }</td>
        <td class="${item.ERRORNAME ? "errInfo" : ""}" >${item.NAME}</td>
        <td class="${item.ERRORYEAR ? "errInfo" : ""}">${item.YEAR}</td>
    </tr>
    <tr class="hidden_row hidden_row_${data.name.toString().toLowerCase()}${
        index + 1
      }">
        <td colspan=6>
          <div class="flex gap-10 row-info">
            ${item.CCCD != undefined ? `<p> CCCD: ${item.CCCD} </p>` : ""}
            ${
              item.ADDRESS != undefined
                ? `<p> Địa chỉ: ${item.ADDRESS} </p>`
                : ""
            }
            ${item.POINT != undefined ? `<p> Điểm: ${item.POINT} </p>` : ""}
            ${
              item.RESULT != undefined ? `<p> Kết quả: ${item.RESULT} </p>` : ""
            }
            ${item.CLASS != undefined ? `<p> Lớp: ${item.CLASS} </p>` : ""}
            ${
              item.DRIVING != undefined
                ? `<p> Bằng lái: ${item.DRIVING} </p>`
                : ""
            }
            ${item.NOT != undefined ? `<p> DS: ${item.DRIVING} </p>` : ""}
          </div>
        </td>
    </tr>`;
    });
  } else if (index === 1 || index === 2) {
    const DSLy = data.saveData[index].SaveDataStorage.filter(
      (item) =>
        item.List == "LÝ THUYẾT" || item.NOT == "Trượt" || item.NOT == "Vắng"
    );
    const DSMp = data.saveData[index].SaveDataStorage.filter(
      (item) =>
        item.List == "MÔ PHỎNG" ||
        item.NOT == "Trượt MP" ||
        item.NOT == "Vắng MP"
    );
    const DSH = data.saveData[index].SaveDataStorage.filter(
      (item) =>
        item.List == "HÌNH" || item.NOT == "Trượt H" || item.NOT == "Vắng H"
    );
    const DSD = data.saveData[index].SaveDataStorage.filter(
      (item) =>
        item.List == "ĐƯỜNG" || item.NOT == "Trượt Đ" || item.NOT == "Vắng Đ"
    );
    infoTable.innerHTML = `
      <p class="NameList">Danh Sách: <span>${data.gender}</span></p>
      <p class="">Số lượng: <span>Tổng: ${data.saveData[index].SaveDataStorage.length} | B1: ${B1.length} | B2: ${B2.length} | C: ${C.length}  | LT: ${DSLy.length}  | MP: ${DSMp.length}  | H: ${DSH.length}  | D: ${DSD.length}</span></p>`;
    data.saveData[index].SaveDataStorage.map((item, index) => {
      table.innerHTML += `
        <tr class="${
          item.DUPLICATION == "NAMEYEAR"
            ? "DUPNAMEYEAR"
            : item.DUPLICATION == "NAME"
            ? "DUPNAME"
            : ""
        } ${item.NOTHAVE ? "NOTHAVE" : ""} ${data.name + index} ${
        index + 1 == DSLy.length
          ? "br-list"
          : index + 1 == DSLy.length + DSMp.length
          ? "br-list"
          : index + 1 == DSLy.length + DSMp.length + DSH.length
          ? "br-list"
          : index + 1 == DSLy.length + DSMp.length + DSH.length + DSD.length
          ? "br-list"
          : ""
      }" onclick="showCheckRow(this)" ondblclick="showHideRow('hidden_row_${data.name
        .toString()
        .toLowerCase()}${index + 1}')">
        <th scope="row">${index + 1}</th>
        <td class="${item.ERRORRANK ? "errInfo" : ""}">${item.RANK}</td>
        <td class="${item.ERRORSBD ? "errInfo" : ""}">${
        item.STT != undefined ? item.STT : item.SBD
      }</td>
        <td class="${item.ERRORNAME ? "errInfo" : ""}" >${item.NAME}</td>
        <td class="${item.ERRORYEAR ? "errInfo" : ""}">${item.YEAR}</td>
        <td class="${item.ERRORList ? "errInfo" : ""}">${
        item.NOT ? item.NOT : item.List
      }</td>
    </tr>
    <tr class="hidden_row hidden_row_${data.name.toString().toLowerCase()}${
        index + 1
      }">
        <td colspan=6>
          <div class="flex gap-10 row-info">
            ${item.CCCD != undefined ? `<p> CCCD: ${item.CCCD} </p>` : ""}
            ${
              item.ADDRESS != undefined
                ? `<p> Địa chỉ: ${item.ADDRESS} </p>`
                : ""
            }
            ${item.POINT != undefined ? `<p> Điểm: ${item.POINT} </p>` : ""}
            ${
              item.RESULT != undefined ? `<p> Kết quả: ${item.RESULT} </p>` : ""
            }
            ${item.CLASS != undefined ? `<p> Lớp: ${item.CLASS} </p>` : ""}
            ${
              item.DRIVING != undefined
                ? `<p> Bằng lái: ${item.DRIVING} </p>`
                : ""
            }
          </div>
        </td>
    </tr>`;
    });
  }
}
async function showHideRow(row) {
  $("." + row).toggle();
}
async function showCheckRow(e) {
  CheckMode && console.log(e);
  $(e).toggleClass("TextChecked");
}
async function swapElements(arr, i1, i2) {
  if (arr[i1]) {
    let arrOld = arr[i2];
    arr.splice(i2, 1, arr[i1]);
    arr[i1] = arrOld;
    arr[i1]["SMove"] = true;
  }
}

async function moveNotHaveLast(arr, i, item) {
  if (i >= 0 && i < arr.length) {
    if (item === arr[i]) {
      // Lấy phần tử tại chỉ số index và xóa nó từ mảng
      let element = arr.splice(i, 1)[0];
      // Đưa phần tử đã xóa vào cuối mảng
      arr.push(element);
    }
  }
  return arr;
}
async function SwapData(data1, data2) {
  const local = data2;
  data1.map((item1, index1) => {
    return local.some((val, index2) => {
      if (item1.NOTHAVE) {
        // console.log(item1);
        moveNotHaveLast(data1, index1, item1);
      }
      // console.log(item1, val);
      if (
        item1.NAME.toString().trim().toUpperCase() ===
          val.NAME.toString().trim().toUpperCase() &&
        item1.YEAR.toString().trim().toUpperCase() ===
          val.YEAR.toString().trim().toUpperCase() &&
        item1.RANK.toString().trim().toUpperCase() ===
          val.RANK.toString().trim().toUpperCase() &&
        !val.SMove
      ) {
        return swapElements(data2, index1, index2);
      } else if (
        item1.NAME.toString().trim().toUpperCase() !==
          val.NAME.toString().trim().toUpperCase() &&
        item1.YEAR.toString().trim().toUpperCase() ===
          val.YEAR.toString().trim().toUpperCase() &&
        item1.RANK.toString().trim().toUpperCase() ===
          val.RANK.toString().trim().toUpperCase() &&
        !val.SMove
      ) {
        if (
          item1.NAME.toString()
            .trim()
            .toUpperCase()
            .includes(val.NAME.substr(0, item1.NAME.length)) &&
          !val.SMove
        ) {
          // console.log(item1);
          return swapElements(data2, index1, index2);
        }
      }
    });
  });
}

function findVang() {
  let VLT = DataBase[0].LT.saveData[2].SaveDataStorage,
    TLT = DataBase[0].LT.saveData[1].SaveDataStorage,
    VMP = DataBase[0].MP.saveData[2].SaveDataStorage,
    TMP = DataBase[0].MP.saveData[1].SaveDataStorage,
    VH = DataBase[0].H.saveData[2].SaveDataStorage,
    TH = DataBase[0].H.saveData[1].SaveDataStorage,
    VD = DataBase[0].D.saveData[2].SaveDataStorage;
  TL = DataBase[0].TL.saveData[2].SaveDataStorage;
  TLHD = TL.filter((item) => item.INFORANK === "SH lại H + Đ");
  TLD = TL.filter((item) => item.INFORANK === "SH lại Đ");
  // filter(VMP, VLT);
  VMP = filter(VMP, VLT);
  VMP = filter(VMP, TLT);
  VMP = filter(VMP, TLHD);
  VMP = filter(VMP, TLD);

  VH = filter(VH, VLT);
  VH = filter(VH, TLT);
  VH = filter(VH, VMP);
  VH = filter(VH, TMP);
  VH = filter(VH, TLD);

  VD = filter(VD, VLT);
  VD = filter(VD, TLT);
  VD = filter(VD, VMP);
  VD = filter(VD, TMP);
  VD = filter(VD, VH);
  VD = filter(VD, TH);
  const newData = VLT.concat(VMP, VH, VD);
  DataBase[0].Vang.saveData[2].SaveDataStorage = newData;
}

function filter(set, check) {
  return set.filter((item) => {
    return !check.some(
      (val) =>
        item.NAME.toString().trim().toUpperCase() ===
          val.NAME.toString().trim().toUpperCase() &&
        item.RANK.toString().trim().toUpperCase() ===
          val.RANK.toString().trim().toUpperCase() &&
        item.YEAR.toString().trim().toUpperCase() ===
          val.YEAR.toString().trim().toUpperCase()
    );
  });
}

async function checkTL(data, e) {
  const filterStudent = data.filter((item) => item.STT !== undefined);
  CheckMode && console.log(filterStudent);
  filterStudent.map((item) => {
    DataBase[0][e.target.id].change.map((change) => {
      renameKeys(item, change, e.target.id);
    });
  });
  DataBase[0][e.target.id].saveData[2].SaveDataStorage = filterStudent;
}

async function CheckList(item1, item2) {
  item1.map((item, index) => {
    if (
      item.NAME === item2[index].NAME &&
      item.YEAR === item2[index].YEAR &&
      item.RANK === item2[index].RANK
    )
      if (
        (item.List == "LÝ THUYẾT" && item2[index].NOT == "Trượt") ||
        (item.List == "LÝ THUYẾT" && item2[index].NOT == "Vắng")
      ) {
        item["ERRORList"] = false;
        item2[index]["ERRORList"] = false;
      } else if (
        (item.List == "MÔ PHỎNG" && item2[index].NOT == "Trượt MP") ||
        (item.List == "MÔ PHỎNG" && item2[index].NOT == "Vắng MP")
      ) {
        item["ERRORList"] = false;
        item2[index]["ERRORList"] = false;
      } else if (
        (item.List == "HÌNH" && item2[index].NOT == "Trượt H") ||
        (item.List == "HÌNH" && item2[index].NOT == "Vắng H")
      ) {
        item["ERRORList"] = false;
        item2[index]["ERRORList"] = false;
      } else if (
        (item.List == "ĐƯỜNG" && item2[index].NOT == "Trượt Đ") ||
        (item.List == "ĐƯỜNG" && item2[index].NOT == "Vắng Đ")
      ) {
        item["ERRORList"] = false;
        item2[index]["ERRORList"] = false;
      } else {
        item["ERRORList"] = true;
        item2[index]["ERRORList"] = true;
      }
  });
}

function total() {
  const DAT = DataBase[0].D.saveData[0].SaveDataStorage;
  const TRUOT = DataBase[0].Truot.saveData[1].SaveDataStorage;
  const VANG = DataBase[0].Vang.saveData[2].SaveDataStorage;

  let all = [].concat(DAT, TRUOT, VANG);
  KQDataBase.map((item) => {
    if (item.rank != "CỘNG") {
      item.TSHS = all.filter((value) => {
        return value.RANK == item.rank;
      });
      item.LTD = DataBase[0].LT.saveData[0].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.LTR = DataBase[0].LT.saveData[1].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.LTTS = [].concat(item.LTD, item.LTR);

      item.MPD = DataBase[0].MP.saveData[0].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.MPR = DataBase[0].MP.saveData[1].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.MPTS = [].concat(item.MPD, item.MPR);

      item.HD = DataBase[0].H.saveData[0].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.HR = DataBase[0].H.saveData[1].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.HTS = [].concat(item.HD, item.HR);

      item.DD = DataBase[0].D.saveData[0].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.DR = DataBase[0].D.saveData[1].SaveDataStorage.filter(
        (key) => key.RANK == item.rank
      );
      item.DTS = [].concat(item.DD, item.DR);
      item.KQD = item.DTS;
    }
  });
  KQDataBase[3].TSHS = totalItem(
    KQDataBase[0].TSHS,
    KQDataBase[1].TSHS,
    KQDataBase[2].TSHS
  );
  KQDataBase[3].LTTS = totalItem(
    KQDataBase[0].LTTS,
    KQDataBase[1].LTTS,
    KQDataBase[2].LTTS
  );
  KQDataBase[3].LTD = totalItem(
    KQDataBase[0].LTD,
    KQDataBase[1].LTD,
    KQDataBase[2].LTD
  );
  KQDataBase[3].LTR = totalItem(
    KQDataBase[0].LTR,
    KQDataBase[1].LTR,
    KQDataBase[2].LTR
  );

  KQDataBase[3].MPTS = totalItem(
    KQDataBase[0].MPTS,
    KQDataBase[1].MPTS,
    KQDataBase[2].MPTS
  );
  KQDataBase[3].MPD = totalItem(
    KQDataBase[0].MPD,
    KQDataBase[1].MPD,
    KQDataBase[2].MPD
  );
  KQDataBase[3].MPR = totalItem(
    KQDataBase[0].MPR,
    KQDataBase[1].MPR,
    KQDataBase[2].MPR
  );

  KQDataBase[3].HTS = totalItem(
    KQDataBase[0].HTS,
    KQDataBase[1].HTS,
    KQDataBase[2].HTS
  );
  KQDataBase[3].HD = totalItem(
    KQDataBase[0].HD,
    KQDataBase[1].HD,
    KQDataBase[2].HD
  );
  KQDataBase[3].HR = totalItem(
    KQDataBase[0].HR,
    KQDataBase[1].HR,
    KQDataBase[2].HR
  );

  KQDataBase[3].DTS = totalItem(
    KQDataBase[0].DTS,
    KQDataBase[1].DTS,
    KQDataBase[2].DTS
  );
  KQDataBase[3].DD = totalItem(
    KQDataBase[0].DD,
    KQDataBase[1].DD,
    KQDataBase[2].DD
  );
  KQDataBase[3].DR = totalItem(
    KQDataBase[0].DR,
    KQDataBase[1].DR,
    KQDataBase[2].DR
  );

  KQDataBase[3].KQD = totalItem(
    KQDataBase[0].KQD,
    KQDataBase[1].KQD,
    KQDataBase[2].KQD
  );
  DataMoney[0].quantity = KQDataBase[3].LTTS.length;
  DataMoney[1].quantity = KQDataBase[3].MPTS.length;
  DataMoney[2].quantity = KQDataBase[3].HTS.length;
  DataMoney[3].quantity = KQDataBase[3].DTS.length;
  DataMoney[4].quantity = KQDataBase[3].KQD.length;
  renderKQ(KQDataBase);
  totalPrice(DataMoney);
}

function renderKQ(data) {
  const KQ = document.querySelector(".render-KQ");
  KQ.innerHTML = "";
  data.map((item) => {
    KQ.innerHTML += `
    <tr>
    <th scope="row">${item.rank}</th>
    <td>${item.TSHS.length}</td>
    <td class="right-br">${item.LTTS.length}</td>
    <td class="right-br">${item.LTD.length}</td>
    <td>${item.LTR.length}</td>
    <td class="right-br">${item.MPTS.length}</td>
    <td class="right-br">${item.MPD.length}</td>
    <td>${item.MPR.length}</td>
    <td class="right-br">${item.HTS.length}</td>
    <td class="right-br">${item.HD.length}</td>
    <td>${item.HR.length}</td>
    <td class="right-br">${item.DTS.length}</td>
    <td class="right-br">${item.DD.length}</td>
    <td>${item.DR.length}</td>
    <td>${item.KQD.length}</td>
  </tr>`;
  });
}

function totalItem(a, b, c) {
  return [].concat(a, b, c);
}

function totalPrice(data) {
  data.map((item, index) => {
    data[index].totalPrice = item.quantity * item.price;
  });
  renderMoney();
  function renderMoney() {
    const MONEY = document.querySelector(".render-Money");
    const totalMoney = document.querySelector(".totalMoney");
    let total = 0;
    MONEY.innerHTML = "";
    totalMoney.innerHTML = "";
    data.map((item, index) => {
      console.log(item);
      total += item.totalPrice;
      MONEY.innerHTML += `
      <tr>
      <th scope="row">${item.id}</th>
      <th>${item.name}</th>
      <td>${formatMoney(parseFloat(item.quantity), ".")}</td>
      <td>${formatMoney(parseFloat(item.price), ".")}</td>
      <td>${formatMoney(parseFloat(item.totalPrice), ".")}</td>
    </tr>
    `;
    });
    totalMoney.innerHTML = formatMoney(parseFloat(total), ".");
  }
}

function formatMoney(str, characters) {
  return str.toString().replace(/\B(?=(\d{3})+(?!\d))/g, characters);
}

function setItemLocal() {
  localStorage.setItem("DATA_BASE", JSON.stringify(DataBase));
  localStorage.setItem("KQ_DATA_BASE", JSON.stringify(KQDataBase));
  localStorage.setItem("KQ_DATA_MONEY", JSON.stringify(DataMoney));
}
function resetItemLocal() {
  localStorage.setItem("DATA_BASE", JSON.stringify([]));
  localStorage.setItem("KQ_DATA_BASE", JSON.stringify([]));
  localStorage.setItem("KQ_DATA_MONEY", JSON.stringify([]));
}

async function timerDelay(number, max) {
  const progress = $(".progress-bar");
  setTimeout(() => {
    progress.text(`${100 * (number / max)}%`);
    progress.css("width", `${100 * (number / max)}%`);
    if (100 * (number / max) === 100) {
      progress.css("background-color", "green");
      setTimeout(() => {
        closeModal();
      }, 2000);
    }
  }, 580);
}

function closeModal() {
  modal.hide();
}

async function timerError() {
  const progress = $(".progress-bar");
  progress.css("background-color", "red");
  setTimeout(() => {
    closeModal();
  }, 2000);
}
