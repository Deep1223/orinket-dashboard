import Config from '../config/config';

const NoDataFound = () => {
  return (
    <div className="d-flex justify-content-center align-items-center w-100 h-100">
      <div className="text-muted text-center">
        <img
          src="/No_Data_Found.svg"
          alt={Config.noDataFound}
          style={{ width: 220, maxWidth: '100%', marginBottom: 8 }}
        />
        <div>{Config.noDataFound}</div>
      </div>
    </div>
  );
};

export default NoDataFound;

