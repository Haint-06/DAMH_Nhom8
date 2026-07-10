const API = "http://localhost:3000";

function hienThiTrangThai(status) {
    switch (status) {
        case "Active":
            return "Đang sử dụng";
        case "Maintenance":
            return "Bảo trì";
        case "Inactive":
            return "Trống";
        default:
            return status;
    }
}

let phongHops = [];
let idDangSua = null;

function doiTenField(room) {
  return {
    id: room.id,
    ten: room.roomName,
    soCho: room.capacity,
    thietBi: room.equipment || [],
    trangThai: room.status
  };
}

async function loadRooms() {
  const res = await fetch(`${API}/rooms`);
  const rooms = await res.json();
  phongHops = rooms.map(doiTenField);
  hienDanhSachPhong();
}

function hienFormThem() {
  idDangSua = null;
  document.getElementById("formThem").classList.remove("hidden");
  document.getElementById("chiTietPhong").innerHTML = "Đang thêm phòng họp mới.";
  xoaForm();
}

function hienDanhSachPhong() {
  let roomList = document.getElementById("roomList");
  roomList.innerHTML = "";

  phongHops.forEach((phong, index) => {
    roomList.innerHTML += `
      <div class="room-item">
        <h3>${phong.ten}</h3>
        <p><b>Số chỗ:</b> ${phong.soCho}</p>
        <p><b>Trạng thái:</b> ${hienThiTrangThai(phong.trangThai)}</p>

        <button class="btn btn-blue" onclick="xemChiTiet(${index})">Xem chi tiết</button>
        <button class="btn" onclick="suaPhong(${index})">Sửa</button>
        <button class="btn btn-red" onclick="xoaPhong(${index})">Xóa</button>
      </div>
    `;
  });

  capNhatThongKe();
}

async function themPhong() {
  let phong = {
    roomName: document.getElementById("tenPhong").value,
    capacity: Number(document.getElementById("soCho").value),
    equipment: document.getElementById("thietBi").value.split(",").map(x => x.trim()),
    status: document.getElementById("trangThai").value
  };

  if (phong.roomName === "" || phong.capacity === 0) {
    alert("Vui lòng nhập tên phòng và số chỗ!");
    return;
  }

  if (idDangSua === null) {
    await fetch(`${API}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phong)
    });
    alert("Đã thêm phòng họp!");
  } else {
    await fetch(`${API}/rooms/${idDangSua}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phong)
    });
    alert("Đã cập nhật phòng họp!");
    idDangSua = null;
  }

  xoaForm();
  loadRooms();
}

function xemChiTiet(index) {
  let phong = phongHops[index];

  document.getElementById("chiTietPhong").innerHTML = `
    <h3>${phong.ten}</h3>
    <p><b>Số chỗ:</b> ${phong.soCho}</p>
    <p><b>Thiết bị:</b></p>
    <ul>
      ${phong.thietBi.map(tb => `<li>${tb}</li>`).join("")}
    </ul>
    <p><b>Trạng thái:</b> ${phong.trangThai}</p>
  `;
}

function suaPhong(index) {
  let phong = phongHops[index];
  idDangSua = phong.id;

  document.getElementById("formThem").classList.remove("hidden");
  document.getElementById("tenPhong").value = phong.ten;
  document.getElementById("soCho").value = phong.soCho;
  document.getElementById("thietBi").value = phong.thietBi.join(", ");
  document.getElementById("trangThai").value = phong.trangThai;

  document.getElementById("chiTietPhong").innerHTML = "Đang sửa thông tin phòng họp.";
}

async function xoaPhong(index) {
  let xacNhan = confirm("Bạn có chắc muốn xóa phòng họp này không?");
  if (!xacNhan) return;

  await fetch(`${API}/rooms/${phongHops[index].id}`, {
    method: "DELETE"
  });

  document.getElementById("chiTietPhong").innerHTML = "Đã xóa phòng họp.";
  loadRooms();
}

function xoaForm() {
  document.getElementById("tenPhong").value = "";
  document.getElementById("soCho").value = "";
  document.getElementById("thietBi").value = "";
  document.getElementById("trangThai").value = "Inactive";
}

function capNhatThongKe() {
  document.getElementById("tongPhong").innerText = phongHops.length + " phòng họp";
  let soPhongTrong = phongHops.filter(p => p.trangThai === "Inactive").length;
  document.getElementById("phongTrong").innerText = soPhongTrong + " phòng đang trống";
}

loadRooms();