const Dashboard = () => {
  return (
    <div className="min-vh-100 p-4">
      <div className="row g-4">
        <div className="col-12">
          <div className="bg-white rounded-custom-lg shadow-custom p-4">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <h2 className="h5 fw-semibold text-dark">Dashboard</h2>
              <span className="text-muted small">Common-project public assets preview</span>
            </div>

            <div className="row g-3">
              <div className="col-md-3 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center">
                  <img
                    src="/window.svg"
                    alt="Window"
                    style={{ width: 64, height: 64, marginBottom: 8 }}
                  />
                  <div className="fw-semibold">Window</div>
                  <div className="text-muted small">UI shell illustration</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center">
                  <img
                    src="/globe.svg"
                    alt="Globe"
                    style={{ width: 64, height: 64, marginBottom: 8 }}
                  />
                  <div className="fw-semibold">Globe</div>
                  <div className="text-muted small">HTTP / domain visual</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center">
                  <img
                    src="/file.svg"
                    alt="File"
                    style={{ width: 64, height: 64, marginBottom: 8 }}
                  />
                  <div className="fw-semibold">File</div>
                  <div className="text-muted small">Data / records illustration</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center">
                  <img
                    src="/No_Data_Found.svg"
                    alt="No Data"
                    style={{ width: 64, height: 64, marginBottom: 8 }}
                  />
                  <div className="fw-semibold">Empty State</div>
                  <div className="text-muted small">Used across grids as fallback</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center">
                  <img
                    src="/next.svg"
                    alt="Next"
                    style={{ width: 64, height: 64, marginBottom: 8 }}
                  />
                  <div className="fw-semibold">Next Logo</div>
                  <div className="text-muted small">Sample tech branding</div>
                </div>
              </div>

              <div className="col-md-3 col-sm-6">
                <div className="border rounded-3 p-3 h-100 d-flex flex-column align-items-center text-center">
                  <img
                    src="/vercel.svg"
                    alt="Vercel"
                    style={{ width: 64, height: 64, marginBottom: 8 }}
                  />
                  <div className="fw-semibold">Vercel Logo</div>
                  <div className="text-muted small">Deployment placeholder</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

