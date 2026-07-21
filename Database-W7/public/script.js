const API = window.location.origin;

let phongHops = [];
let idDangSua = null;

function hienThiTrangThai(status) {
  return {
    Active: "Đang sử dụng",
    Maintenance: "Bảo trì",
    Inactive: "Trống"
  }[status] || status;
}

function doiTenField(room) {
  return {
    id: room.id,
    ten: room.roomName,
    soCho: room.capacity,
    thietBi: room.equipment || [],
    trangThai: room.status,
    bookings: room.bookings || []
  };
}

function dinhDangNgayGio(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

async function docLoi(res) {
  try {
    const data = await res.json();
    return Array.isArray(data.message) ? data.message.join("\n") : (data.message || "Có lỗi xảy ra");
  } catch {
    return "Không thể kết nối hệ thống";
  }
}

async function loadRooms() {
  try {
    const res = await fetch(`${API}/rooms`);
    if (!res.ok) throw new Error(await docLoi(res));
    phongHops = (await res.json()).map(doiTenField);
    hienDanhSachPhong();
  } catch (error) {
    alert(error.message);
  }
}

function hienFormThem() {
  idDangSua = null;
  xoaForm();
  document.getElementById("formThem").classList.remove("hidden");
  document.getElementById("chiTietPhong").innerHTML = "Đang thêm phòng họp mới.";
}

function huyForm() {
  idDangSua = null;
  xoaForm();
  document.getElementById("formThem").classList.add("hidden");
}

function hienDanhSachPhong() {
  const roomList = document.getElementById("roomList");
  roomList.innerHTML = "";

  phongHops.forEach((phong, index) => {
    roomList.innerHTML += `
      <div class="room-item">
        <h3>${phong.ten}</h3>
        <p><b>Số chỗ:</b> ${phong.soCho}</p>
        <p><b>Trạng thái:</b> ${hienThiTrangThai(phong.trangThai)}</p>
        <p><b>Số lịch:</b> ${phong.bookings.length}</p>
        <button class="btn btn-blue" onclick="xemChiTiet(${index})">Xem chi tiết</button>
        <button class="btn" onclick="suaPhong(${index})">Sửa</button>
        <button class="btn btn-red" onclick="xoaPhong(${index})">Xóa</button>
      </div>`;
  });

  capNhatThongKe();
}

function layDuLieuPhong() {
  return {
    roomName: document.getElementById("tenPhong").value.trim(),
    capacity: Number(document.getElementById("soCho").value),
    equipment: document.getElementById("thietBi").value
      .split(",").map(x => x.trim()).filter(Boolean),
    status: document.getElementById("trangThai").value
  };
}

function layDuLieuLich(roomId) {
  const meetingTitle = document.getElementById("tenCuocHop").value.trim();
  const organizerName = document.getElementById("nguoiToChuc").value.trim();
  const date = document.getElementById("ngaySuDung").value;
  const start = document.getElementById("gioBatDau").value;
  const end = document.getElementById("gioKetThuc").value;

  const coNhapMotPhan = meetingTitle || organizerName || date || start || end;
  if (!coNhapMotPhan) return null;

  if (!meetingTitle || !organizerName || !date || !start || !end) {
    throw new Error("Vui lòng nhập đầy đủ tên cuộc họp, người tổ chức, ngày và thời gian.");
  }

  const startTime = new Date(`${date}T${start}:00`);
  const endTime = new Date(`${date}T${end}:00`);
  if (endTime <= startTime) throw new Error("Giờ kết thúc phải lớn hơn giờ bắt đầu.");

  return {
    roomId,
    meetingTitle,
    organizerName,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    status: "Confirmed"
  };
}

async function themPhong() {
  try {
    const phong = layDuLieuPhong();

    if (!phong.roomName || !Number.isInteger(phong.capacity) || phong.capacity <= 0) {
      throw new Error("Vui lòng nhập tên phòng và số chỗ lớn hơn 0.");
    }

    if (!/^[\p{L}\p{N}\s,.]+$/u.test(phong.equipment.join(",")) && phong.equipment.length) {
      throw new Error("Thiết bị chỉ được chứa chữ, số, dấu phẩy và dấu chấm.");
    }

    let roomId = idDangSua;
    const method = idDangSua === null ? "POST" : "PATCH";
    const url = idDangSua === null ? `${API}/rooms` : `${API}/rooms/${idDangSua}`;

    const roomRes = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(phong)
    });
    if (!roomRes.ok) throw new Error(await docLoi(roomRes));

    const savedRoom = await roomRes.json();
    roomId = savedRoom.id;

    const booking = layDuLieuLich(roomId);
    if (booking) {
      const bookingRes = await fetch(`${API}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking)
      });
      if (!bookingRes.ok) throw new Error(await docLoi(bookingRes));
    }

    alert(idDangSua === null ? "Đã thêm phòng họp và lịch thành công!" : "Đã cập nhật phòng họp thành công!");
    idDangSua = null;
    xoaForm();
    document.getElementById("formThem").classList.add("hidden");
    await loadRooms();
  } catch (error) {
    alert(error.message);
  }
}

function xemChiTiet(index) {
  const phong = phongHops[index];
  const lichHtml = phong.bookings.length
    ? phong.bookings.map(b => `
        <div class="booking-item">
          <p><b>Cuộc họp:</b> ${b.meetingTitle}</p>
          <p><b>Người tổ chức:</b> ${b.organizerName}</p>
          <p><b>Bắt đầu:</b> ${dinhDangNgayGio(b.startTime)}</p>
          <p><b>Kết thúc:</b> ${dinhDangNgayGio(b.endTime)}</p>
        </div>`).join("")
    : "<p>Không có lịch sử sử dụng.</p>";

  document.getElementById("chiTietPhong").innerHTML = `
    <h3>${phong.ten}</h3>
    <p><b>Số chỗ:</b> ${phong.soCho}</p>
    <p><b>Thiết bị:</b> ${phong.thietBi.join(", ") || "Không có"}</p>
    <p><b>Trạng thái:</b> ${hienThiTrangThai(phong.trangThai)}</p>
    <h4>Lịch đặt / lịch sử sử dụng</h4>
    ${lichHtml}`;
}

function suaPhong(index) {
  const phong = phongHops[index];
  idDangSua = phong.id;

  document.getElementById("formThem").classList.remove("hidden");
  document.getElementById("tenPhong").value = phong.ten;
  document.getElementById("soCho").value = phong.soCho;
  document.getElementById("thietBi").value = phong.thietBi.join(", ");
  document.getElementById("trangThai").value = phong.trangThai;

  document.getElementById("tenCuocHop").value = "";
  document.getElementById("nguoiToChuc").value = "";
  document.getElementById("ngaySuDung").value = "";
  document.getElementById("gioBatDau").value = "";
  document.getElementById("gioKetThuc").value = "";
  document.getElementById("chiTietPhong").innerHTML = "Đang sửa phòng. Có thể nhập thêm một lịch mới ở bên dưới.";
}

async function xoaPhong(index) {
  if (!confirm("Bạn có chắc muốn xóa phòng họp này không?")) return;
  try {
    const res = await fetch(`${API}/rooms/${phongHops[index].id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await docLoi(res));
    document.getElementById("chiTietPhong").innerHTML = "Đã xóa phòng họp.";
    await loadRooms();
  } catch (error) {
    alert(error.message);
  }
}

function xoaForm() {
  ["tenPhong", "soCho", "thietBi", "tenCuocHop", "nguoiToChuc", "ngaySuDung", "gioBatDau", "gioKetThuc"]
    .forEach(id => document.getElementById(id).value = "");
  document.getElementById("trangThai").value = "Inactive";
}

function capNhatThongKe() {
  document.getElementById("tongPhong").innerText = `${phongHops.length} phòng họp`;
  const soPhongTrong = phongHops.filter(p => p.trangThai === "Inactive").length;
  document.getElementById("phongTrong").innerText = `${soPhongTrong} phòng đang trống`;
}

function layNgayDiaPhuong(value) {
  if (!value) return "";

  const ngay = new Date(value);

  const nam = ngay.getFullYear();
  const thang = String(ngay.getMonth() + 1).padStart(2, "0");
  const ngayTrongThang = String(ngay.getDate()).padStart(2, "0");

  return `${nam}-${thang}-${ngayTrongThang}`;
}

function timKiemTheoNgay() {
  const ngayCanTim = document.getElementById("timTheoNgay").value;

  if (!ngayCanTim) {
    alert("Vui lòng chọn ngày cần tìm.");
    return;
  }

  const ketQua = phongHops.filter(phong =>
    phong.bookings.some(booking =>
      layNgayDiaPhuong(booking.startTime) === ngayCanTim
    )
  );

  hienDanhSachTheoNgay(ketQua, ngayCanTim);
}

function hienDanhSachTheoNgay(danhSach, ngayCanTim) {
  const roomList = document.getElementById("roomList");
  roomList.innerHTML = "";

  if (danhSach.length === 0) {
    roomList.innerHTML = `
      <p class="khong-tim-thay">
        Không tìm thấy phòng
      </p>
    `;
    return;
  }

  danhSach.forEach(phong => {
    const indexGoc = phongHops.findIndex(item => item.id === phong.id);

    const lichTrongNgay = phong.bookings.filter(booking =>
      layNgayDiaPhuong(booking.startTime) === ngayCanTim
    );

    roomList.innerHTML += `
      <div class="room-item">
        <h3>${phong.ten}</h3>

        <p><b>Số chỗ:</b> ${phong.soCho}</p>

        <p>
          <b>Trạng thái:</b>
          ${hienThiTrangThai(phong.trangThai)}
        </p>

        <p>
          <b>Số lịch trong ngày:</b>
          ${lichTrongNgay.length}
        </p>

        ${lichTrongNgay.map(booking => `
          <div class="booking-item">
            <p><b>Cuộc họp:</b> ${booking.meetingTitle}</p>
            <p><b>Người tổ chức:</b> ${booking.organizerName}</p>
            <p><b>Bắt đầu:</b> ${dinhDangNgayGio(booking.startTime)}</p>
            <p><b>Kết thúc:</b> ${dinhDangNgayGio(booking.endTime)}</p>
          </div>
        `).join("")}

        <button
          class="btn btn-blue"
          onclick="xemChiTiet(${indexGoc})"
        >
          Xem chi tiết
        </button>

        <button
          class="btn"
          onclick="suaPhong(${indexGoc})"
        >
          Sửa
        </button>

        <button
          class="btn btn-red"
          onclick="xoaPhong(${indexGoc})"
        >
          Xóa
        </button>
      </div>
    `;
  });
}

function xoaTimKiem() {
  document.getElementById("timTheoNgay").value = "";
  hienDanhSachPhong();
}

loadRooms();
