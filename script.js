
let meterData = [];

const API_URL =
"https://script.google.com/macros/s/AKfycbzpAvRVIxHsH8GHGbtiTLyhUBvt3SR6Kbr_CGAnNQwQAmosX5xMHRtlj5gyxij6uDUX-A/exec";

/* ===================================
   ELEMENTS
=================================== */

const meterCard = document.getElementById("meterCard");
const staffCard = document.getElementById("staffCard");

const meterPortal = document.getElementById("meterPortal");
const staffPortal = document.getElementById("staffPortal");

const meterSearch = document.getElementById("meterSearch");
const meterStaffSearch = document.getElementById("meterStaffSearch");

const staffSearch = document.getElementById("staffSearch");
const staffMeterSearch = document.getElementById("staffMeterSearch");

/* ===================================
   LOAD DATA
=================================== */

async function loadData() {

    try {

        const response =
            await fetch(API_URL);

        meterData =
            await response.json();

        if (!Array.isArray(meterData)) {

            throw new Error(
                "Invalid JSON format"
            );
        }

        console.log(
            "Data Loaded:",
            meterData
        );

        loadDashboard();
        populateDropdowns();

    }
    catch (error) {

        console.error(error);

        alert(
            "Unable to load data from Google Sheet."
        );
    }
}

loadData();

/* ===================================
   DASHBOARD
=================================== */

function loadDashboard() {

    const uniqueMeters =
        [...new Set(
            meterData
            .map(item => item.Meter)
            .filter(Boolean)
        )];

    const uniqueStaff =
        [...new Set(
            meterData
            .map(item => item.Staff)
            .filter(Boolean)
        )];

    const totalPending =
        meterData.filter(item =>

            item.Status &&
            item.Status.toString()
            .trim()
            .toLowerCase() === "pending"

        ).length;

    document.getElementById("totalMeters").innerText =
        uniqueMeters.length;

    document.getElementById("totalStaff").innerText =
        uniqueStaff.length;

    document.getElementById("totalPending").innerText =
        totalPending;
}

function populateDropdowns() {

    const meterDropdown =
        document.getElementById("meterSearch");

    const meterStaffDropdown =
        document.getElementById("meterStaffSearch");

    const staffDropdown =
        document.getElementById("staffSearch");

    const staffMeterDropdown =
        document.getElementById("staffMeterSearch");

    const meters =
        [...new Set(
            meterData.map(item => item.Meter)
        )];

    const staffs =
        [...new Set(
            meterData.map(item => item.Staff)
        )];

    meterDropdown.innerHTML =
        '<option value="">Select Meter</option>';

    staffMeterDropdown.innerHTML =
        '<option value="">Select Meter</option>';

    meters.forEach(meter => {

        meterDropdown.innerHTML +=
            `<option value="${meter}">${meter}</option>`;

        staffMeterDropdown.innerHTML +=
            `<option value="${meter}">${meter}</option>`;
    });

    meterStaffDropdown.innerHTML =
        '<option value="">Select Staff</option>';

    staffDropdown.innerHTML =
        '<option value="">Select Staff</option>';

    staffs.forEach(staff => {

        meterStaffDropdown.innerHTML +=
            `<option value="${staff}">${staff}</option>`;

        staffDropdown.innerHTML +=
            `<option value="${staff}">${staff}</option>`;
    });
}

/* ===================================
   HELPER FUNCTION
=================================== */

function getPendingCount(meter, staff) {

    return meterData.filter(item =>

        item.Meter &&
        item.Staff &&
        item.Status &&

        item.Meter.toString()
        .trim()
        .toUpperCase() ===
        meter.trim().toUpperCase()

        &&

        item.Staff.toString()
        .trim()
        .toLowerCase() ===
        staff.trim().toLowerCase()

        &&

        item.Status.toString()
        .trim()
        .toLowerCase() ===
        "pending"

    ).length;
}

/* ===================================
   PORTAL SWITCHING
=================================== */

meterCard.addEventListener("click", () => {

    meterPortal.classList.remove("hidden");
    staffPortal.classList.add("hidden");

    window.scrollTo({
        top: meterPortal.offsetTop - 20,
        behavior: "smooth"
    });

});

staffCard.addEventListener("click", () => {

    staffPortal.classList.remove("hidden");
    meterPortal.classList.add("hidden");

    window.scrollTo({
        top: staffPortal.offsetTop - 20,
        behavior: "smooth"
    });

});

/* ===================================
   METER → STAFF
=================================== */

function updateMeterPortal() {

    const selectedMeter =
        meterSearch.value.trim().toUpperCase();

    const selectedStaff =
        meterStaffSearch.value.trim();

    const meterRows =
        meterData.filter(item =>
            item.Meter &&
            item.Meter.toString().toUpperCase() === selectedMeter
        );

    const uniqueStaffRows =
        [...new Set(meterRows.map(item => item.Staff))]
        .map(staff => {

            return {

                Staff: staff,

                Pending: meterRows.filter(row =>

                    row.Staff === staff &&

                    row.Status &&
                    row.Status.toString().toLowerCase() === "pending"

                ).length

            };

        });

    const staffTable =
        document.getElementById("meterStaffTable");

    staffTable.innerHTML = "";

    uniqueStaffRows.forEach((row, index) => {

        staffTable.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${row.Staff}</td>
                <td>${row.Pending}</td>
            </tr>
        `;
    });

    const pendingCount =
        getPendingCount(
            selectedMeter,
            selectedStaff
        );

    document.getElementById(
        "meterPendingCount"
    ).innerText = pendingCount;

    const selectedBody =
        document.getElementById("meterSelectedBody");

    selectedBody.innerHTML = "";

    if (selectedMeter && selectedStaff) {

        selectedBody.innerHTML = `
            <tr>
                <td>${selectedMeter}</td>
                <td>${selectedStaff}</td>
                <td>${pendingCount}</td>
            </tr>
        `;
    }
}

meterSearch.addEventListener(
    "change",
    updateMeterPortal
);

meterStaffSearch.addEventListener(
    "change",
    updateMeterPortal
);

/* ===================================
   STAFF → METER
=================================== */

function updateStaffPortal() {

    const selectedStaff =
        staffSearch.value.trim();

    const selectedMeter =
        staffMeterSearch.value.trim().toUpperCase();

    const staffRows =
        meterData.filter(item =>

            item.Staff &&
            item.Staff.toString().toLowerCase() ===
            selectedStaff.toLowerCase()

        );

    const uniqueMeterRows =
        [...new Set(staffRows.map(item => item.Meter))]
        .map(meter => {

            return {

                Meter: meter,

                Pending: staffRows.filter(row =>

                    row.Meter === meter &&

                    row.Status &&
                    row.Status.toString().toLowerCase() === "pending"

                ).length

            };

        });

    const meterTable =
        document.getElementById("staffMeterTable");

    meterTable.innerHTML = "";

    uniqueMeterRows.forEach((row, index) => {

        meterTable.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${row.Meter}</td>
                <td>${row.Pending}</td>
            </tr>
        `;
    });

    const pendingCount =
        getPendingCount(
            selectedMeter,
            selectedStaff
        );

    document.getElementById(
        "staffPendingCount"
    ).innerText = pendingCount;

    const selectedBody =
        document.getElementById(
            "staffSelectedBody"
        );

    selectedBody.innerHTML = "";

    if (selectedMeter && selectedStaff) {

        selectedBody.innerHTML = `
            <tr>
                <td>${selectedStaff}</td>
                <td>${selectedMeter}</td>
                <td>${pendingCount}</td>
            </tr>
        `;
    }
}

staffSearch.addEventListener(
    "change",
    updateStaffPortal
);

staffMeterSearch.addEventListener(
    "change",
    updateStaffPortal
);

/* ===================================
   UPLOAD BUTTON (TEMP)
=================================== */

document
.getElementById("uploadBtn")
.addEventListener("click", () => {

    const file =
        document.getElementById("excelFile").files[0];

    if (!file) {

        alert("Please select an Excel file.");

        return;
    }

    document.getElementById(
        "uploadStatus"
    ).innerText =
        "Excel upload module will be connected next.";
});

