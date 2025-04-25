from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, validator
import mysql.connector
from typing import List
import datetime
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from fastapi import File, UploadFile, Form
from fastapi.responses import FileResponse
import os
import shutil

app = FastAPI()
# Allow requests from the frontend (add other origins if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow the frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # Log full error to the terminal
    print(f"Validation error at {request.url}")
    print(exc.errors())
    print(f"Body: {await request.body()}")

    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="TruckingBusiness"
    )



#------------------------------------------driver----------------------------------------------------------
# Pydantic models
class driver(BaseModel):
    employee: str
    refered_as: str
    
# Fetch driver name
@app.get("/drivers", response_model=List[driver])
def get_drivers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT employee, refered_as FROM employees WHERE designation = 'driver';")
    drivers = cursor.fetchall()
    cursor.close()
    conn.close()
    return drivers

#-----------------------------------------company---------------------------------------------------------
# Fetch company numbers
@app.get("/company-under", response_model=List[str])
def get_comapny_under():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT Name FROM company;")
    company = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return company

#-----------------------------------------employee---------------------------------------------------------

# Pydantic models
class employees(BaseModel):
    employee: str
    refered_as: Optional[str] = None
    designation: Optional[str] = None
    contact_no:Optional[int] = None
    whatsapp_no:Optional[int] = None
    salary: int
    visa_outstanding: int
    advance_avl: int
    visa_under: str
    visa_exp:Optional[str] = None
    nationality:str
    eid:Optional[int] = None
    health_ins_exp:Optional[str] = None
    emp_ins_exp:Optional[str] = None
    license_exp:Optional[str] = None


         # Validator to ensure load_date is formatted as a string
    @validator('visa_exp', pre=True)
    def format_load_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v
    
             # Validator to ensure load_date is formatted as a string
    @validator('health_ins_exp', pre=True)
    def format_load_date1(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y') 
        return v
    
             # Validator to ensure load_date is formatted as a string
    @validator('emp_ins_exp', pre=True)
    def format_load_date2(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y') 
        return v
    
    @validator('license_exp', pre=True)
    def format_load_date4(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
# Fetch all employees details
@app.get("/employees", response_model=List[employees])
def get_employees():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees;")
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return employees



# Add a new employee
@app.post("/employees")
def add_employee(emp: employees):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO employees (
        employee, refered_as, designation, contact_no, whatsapp_no, salary, visa_outstanding, advance_avl,
        visa_under, visa_exp, nationality, eid, health_ins_exp,
        emp_ins_exp,license_exp
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s, %s);
    """
    values = (
        emp.employee, emp.refered_as, emp.designation, emp.contact_no,emp.whatsapp_no, emp.salary, emp.visa_outstanding,
        emp.advance_avl, emp.visa_under, emp.visa_exp, emp.nationality, emp.eid,
        emp.health_ins_exp, emp.emp_ins_exp, emp.license_exp
    )
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Employee added successfully!"}

# Delete employee by name
@app.delete("/employees/{employee_name}")
def delete_employee(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
        # Fetch document file paths to delete from disk
    cursor.execute("SELECT url FROM employee_documents WHERE employee_name = %s", (employee_name,))
    document_paths = cursor.fetchall()

    # Delete documents from disk
    for doc in document_paths:
        file_path = doc["url"]
        if os.path.exists(file_path):
            os.remove(file_path)

    # Delete documents from DB
    cursor.execute("DELETE FROM employee_documents WHERE employee_name = %s", (employee_name,))

    cursor.execute("DELETE FROM employees WHERE employee = %s;", (employee_name,))
    if cursor.rowcount == 0:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Employee not found")
    
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Employee '{employee_name}' deleted successfully"}

# Get salary of a specific employee
@app.get("/employees/{employee_name}/salary")
def get_employee_salary(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT salary FROM employees WHERE employee = %s;", (employee_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return {"employee": employee_name, "salary": result[0]}
    else:
        raise HTTPException(status_code=404, detail="Employee not found")
    
#get vsia outsanding
@app.get("/employees/{employee_name}/visa-outstanding")
def get_visa_outstanding(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT visa_outstanding FROM employees WHERE employee = %s;", (employee_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"employee": employee_name, "visa_outstanding": result[0]}

#get advance available
@app.get("/employees/{employee_name}/advance-available")
def get_advance_available(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT advance_avl FROM employees WHERE employee = %s;", (employee_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")

    return {"employee": employee_name, "advance_avl": result[0]}


# Get employee by name (full details)
@app.get("/employees/{employee_name}", response_model=employees)
def get_employee(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM employees WHERE employee = %s;", (employee_name,))
    emp = cursor.fetchone()
    cursor.close()
    conn.close()
    if emp:
        return emp
    else:
        raise HTTPException(status_code=404, detail="Employee not found")

# Optional: Update an employee (partial)
@app.put("/employees/{employee_name}")
def update_employee(employee_name: str, emp: employees):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE employees SET 
        employee=%s, refered_as=%s, designation=%s, contact_no=%s,whatsapp_no=%s, salary=%s, visa_outstanding=%s, advance_avl=%s,
        visa_under=%s, visa_exp=%s, nationality=%s, eid=%s, health_ins_exp=%s,
        emp_ins_exp=%s, license_exp=%s
    WHERE employee=%s;
    """
    values = (
        emp.employee, emp.refered_as, emp.designation, emp.contact_no, emp.whatsapp_no, emp.salary, emp.visa_outstanding, emp.advance_avl,
        emp.visa_under, emp.visa_exp, emp.nationality, emp.eid,
        emp.health_ins_exp, emp.emp_ins_exp, emp.license_exp, employee_name
    )
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Employee updated successfully!"}

#-----------------------------------------other_employee---------------------------------------------------------
# Pydantic models
class other_employees(BaseModel):
    employee: str
    owner: str
    refered_as: Optional[str] = None
    designation: Optional[str] = None
    contact_no:Optional[int] = None
    whatsapp_no:Optional[int] = None
    visa_under: str
    visa_exp:Optional[str] = None
    nationality:str
    eid:Optional[int] = None
    health_ins_exp:Optional[str] = None
    emp_ins_exp:Optional[str] = None
    license_exp:Optional[str] = None


         # Validator to ensure load_date is formatted as a string
    @validator('visa_exp', pre=True)
    def format_load_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
             # Validator to ensure load_date is formatted as a string
    @validator('health_ins_exp', pre=True)
    def format_load_date1(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
             # Validator to ensure load_date is formatted as a string
    @validator('emp_ins_exp', pre=True)
    def format_load_date2(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
    @validator('license_exp', pre=True)
    def format_load_date4(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
# Fetch all employees details
@app.get("/other-employees", response_model=List[other_employees])
def get_employees():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_employees;")
    employees = cursor.fetchall()
    cursor.close()
    conn.close()
    return employees



# Add a new employee
@app.post("/other-employees")
def add_employee(emp: other_employees):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO other_employees (
        employee, owner, refered_as, designation, contact_no, whatsapp_no,
        visa_under, visa_exp, nationality, eid, health_ins_exp,
        emp_ins_exp,license_exp
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (
        emp.employee, emp.owner, emp.refered_as, emp.designation, emp.contact_no,emp.whatsapp_no, emp.visa_under, emp.visa_exp, emp.nationality, emp.eid,
        emp.health_ins_exp, emp.emp_ins_exp, emp.license_exp
    )
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Employee added successfully!"}

# Delete employee by name
@app.delete("/other-employees/{employee_name}")
def delete_employee(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM other_employees WHERE employee = %s;", (employee_name,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Employee '{employee_name}' deleted successfully"}

# Get employee by name (full details)
@app.get("/other-employees/{employee_name}", response_model=other_employees)
def get_employee(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_employees WHERE employee = %s;", (employee_name,))
    emp = cursor.fetchone()
    cursor.close()
    conn.close()
    if emp:
        return emp
    else:
        raise HTTPException(status_code=404, detail="Employee not found")

# Optional: Update an employee (partial)
@app.put("/other-employees/{employee_name}")
def update_employee(employee_name: str, emp: other_employees):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE other_employees SET 
        employee=%s, owner=%s, refered_as=%s, designation=%s, contact_no=%s,whatsapp_no=%s,
        visa_under=%s, visa_exp=%s, nationality=%s, eid=%s, health_ins_exp=%s,
        emp_ins_exp=%s, license_exp=%s
    WHERE employee=%s;
    """
    values = (
        emp.employee, emp.owner, emp.refered_as, emp.designation, emp.contact_no, emp.whatsapp_no,
        emp.visa_under, emp.visa_exp, emp.nationality, emp.eid,
        emp.health_ins_exp, emp.emp_ins_exp, emp.license_exp, employee_name
    )
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Employee updated successfully!"}


#-----------------------------------------------------trucks-----------------------------------------
# Pydantic models
class truck(BaseModel):
    truck_number: str
    driver: Optional[str] = None
    year: Optional[int] = None
    vehicle_under: str
    trailer_no: Optional[str] = None
    country:str
    mulkiya_exp:Optional[str] = None
    ins_exp:Optional[str] = None
    truck_value: Optional[int] = None

             # Validator to ensure load_date is formatted as a string
    @validator('mulkiya_exp', pre=True)
    def format_load_datet1(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
                 # Validator to ensure load_date is formatted as a string
    @validator('ins_exp', pre=True)
    def format_load_datet2(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v

# fetch all
@app.get("/trucks", response_model=List[truck])
def get_all_clients():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Trucks;")
    trucks = cursor.fetchall()
    cursor.close()
    conn.close()
    return trucks



# Fetch truck numbers
@app.get("/trucks-num", response_model=List[str])
def get_truck_numbers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT truck_number FROM Trucks;")
    trucks = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return trucks

#add new truck
@app.post("/trucks")
def add_truck(truck_data: truck):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO Trucks (
        truck_number, driver, year, vehicle_under, trailer_no, country, 
        mulkiya_exp, ins_exp, truck_value
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (
        truck_data.truck_number, truck_data.driver,
        truck_data.year, truck_data.vehicle_under, truck_data.trailer_no,truck_data.country,
        truck_data.mulkiya_exp,
        truck_data.ins_exp, truck_data.truck_value
    )
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Truck added successfully!"}

# Delete truck by number and its associated documents
@app.delete("/trucks/{truck_number}")
def delete_truck(truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch document file paths to delete from disk
    cursor.execute("SELECT url FROM truck_documents WHERE truck_number = %s", (truck_number,))
    document_paths = cursor.fetchall()

    # Delete documents from disk
    for doc in document_paths:
        file_path = doc["url"]
        if os.path.exists(file_path):
            os.remove(file_path)

    # Delete documents from DB
    cursor.execute("DELETE FROM truck_documents WHERE truck_number = %s", (truck_number,))

    # Delete truck record
    cursor.execute("DELETE FROM trucks WHERE truck_number = %s", (truck_number,))
    if cursor.rowcount == 0:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Truck not found")

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"Truck '{truck_number}' and associated documents deleted successfully"}


#update truck
@app.put("/trucks/{truck_number}")
def update_truck(truck_number: str, truck_data: truck):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE Trucks SET 
        truck_number=%s, driver=%s, year=%s, vehicle_under=%s, trailer_no=%s, country=%s,
        mulkiya_exp=%s, ins_exp=%s, truck_value=%s
    WHERE truck_number=%s;
    """
    values = (
        truck_data.truck_number, truck_data.driver,
        truck_data.year, truck_data.vehicle_under, truck_data.trailer_no, truck_data.country,
        truck_data.mulkiya_exp,
        truck_data.ins_exp, truck_data.truck_value, truck_number
    )
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Truck not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Truck updated successfully!"}

#get truck driver name
@app.get("/trucks/by-driver/{driver_name}", response_model=List[str])
def get_trucks_by_driver(driver_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT truck_number FROM Trucks WHERE driver = %s;", (driver_name,))
    trucks = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return trucks

#get full truck details
@app.get("/trucks/{truck_number}", response_model=truck)
def get_truck(truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Trucks WHERE truck_number = %s;", (truck_number,))
    truck_data = cursor.fetchone()
    cursor.close()
    conn.close()
    if truck_data:
        return truck_data
    else:
        raise HTTPException(status_code=404, detail="Truck not found")

#-----------------------------------------------------other_trucks-----------------------------------------
# Pydantic models
class other_truck(BaseModel):
    truck_number: str
    owner: str
    driver: Optional[str] = None
    year: Optional[int] = None
    vehicle_under: str
    trailer_no: Optional[str] = None
    country:str
    mulkiya_exp:Optional[str] = None
    ins_exp:Optional[str] = None


             # Validator to ensure load_date is formatted as a string
    @validator('mulkiya_exp', pre=True)
    def format_load_datet1(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v
    
                 # Validator to ensure load_date is formatted as a string
    @validator('ins_exp', pre=True)
    def format_load_datet2(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v

# fetch all
@app.get("/other-trucks", response_model=List[other_truck])
def get_all_clients():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_Trucks;")
    trucks = cursor.fetchall()
    cursor.close()
    conn.close()
    return trucks



# Fetch truck numbers
@app.get("/other-trucks-num", response_model=List[str])
def get_truck_numbers():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT truck_number FROM other_Trucks;")
    trucks = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return trucks

#add new truck
@app.post("/other-trucks")
def add_truck(truck_data: other_truck):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO other_Trucks (
        truck_number, owner, driver, year, vehicle_under, trailer_no, country, 
        mulkiya_exp, ins_exp
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (
        truck_data.truck_number, truck_data.owner, truck_data.driver,
        truck_data.year, truck_data.vehicle_under, truck_data.trailer_no,truck_data.country,
        truck_data.mulkiya_exp,
        truck_data.ins_exp
    )
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Truck added successfully!"}

#delete truck
@app.delete("/other-trucks/{truck_number}")
def delete_truck(truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM other_Trucks WHERE truck_number = %s;", (truck_number,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Truck not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Truck '{truck_number}' deleted successfully"}

#update truck
@app.put("/other-trucks/{truck_number}")
def update_truck(truck_number: str, truck_data: other_truck):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE other_Trucks SET 
        truck_number=%s, owner=%s, driver=%s, year=%s, vehicle_under=%s, trailer_no=%s, country=%s,
        mulkiya_exp=%s, ins_exp=%s
    WHERE truck_number=%s;
    """
    values = (
        truck_data.truck_number, truck_data.driver,
        truck_data.year, truck_data.vehicle_under, truck_data.trailer_no, truck_data.country,
        truck_data.mulkiya_exp,
        truck_data.ins_exp, truck_data.truck_value, truck_number
    )
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Truck not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Truck updated successfully!"}

#get truck driver name
@app.get("/other-trucks/by-driver/{driver_name}", response_model=List[str])
def get_trucks_by_driver(driver_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT truck_number FROM other_Trucks WHERE driver = %s;", (driver_name,))
    trucks = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return trucks

#get full truck details
@app.get("/other-trucks/{truck_number}", response_model=other_truck)
def get_truck(truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_Trucks WHERE truck_number = %s;", (truck_number,))
    truck_data = cursor.fetchone()
    cursor.close()
    conn.close()
    if truck_data:
        return truck_data
    else:
        raise HTTPException(status_code=404, detail="Truck not found")
    
#---------------------------------------trailer--------------------------------------------
class Trailer(BaseModel):
    trailer_no: str
    company_under: str
    mulkiya_exp: Optional[str] = None
    oman_ins_exp: Optional[str] = None
    asset_value: Optional[int] = None

    @validator('mulkiya_exp', pre=True)
    def format_mulkiya_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')
        return v

    @validator('oman_ins_exp', pre=True)
    def format_insurance_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')
        return v


# Fetch all trailers
@app.get("/trailers", response_model=List[Trailer])
def get_all_trailers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM trailers;")
    trailers = cursor.fetchall()
    cursor.close()
    conn.close()
    return trailers

# Fetch a single trailer by number
@app.get("/trailers/{trailer_no}", response_model=Trailer)
def get_trailer(trailer_no: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM trailers WHERE trailer_no = %s;", (trailer_no,))
    trailer = cursor.fetchone()
    cursor.close()
    conn.close()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    return trailer

# Add a trailer
@app.post("/trailers")
def add_trailer(trailer: Trailer):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO trailers (trailer_no, company_under, mulkiya_exp, oman_ins_exp, asset_value)
    VALUES (%s, %s, %s, %s, %s);
    """
    values = (
        trailer.trailer_no, trailer.company_under,
        trailer.mulkiya_exp, trailer.oman_ins_exp, trailer.asset_value
    )
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Trailer added successfully!"}

# Update a trailer
@app.put("/trailers/{trailer_no}")
def update_trailer(trailer_no: str, trailer: Trailer):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE trailers SET company_under=%s, mulkiya_exp=%s, oman_ins_exp=%s, asset_value=%s
    WHERE trailer_no=%s;
    """
    values = (
        trailer.company_under, trailer.mulkiya_exp,
        trailer.oman_ins_exp, trailer.asset_value, trailer_no
    )
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Trailer not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Trailer updated successfully!"}


# Delete a trailer and associated documents
@app.delete("/trailers/{trailer_no}")
def delete_trailer(trailer_no: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Fetch trailer document file paths
    cursor.execute("SELECT url FROM trailer_documents WHERE trailer_number = %s", (trailer_no,))
    document_paths = cursor.fetchall()

    # Delete documents from disk
    for doc in document_paths:
        file_path = doc["url"]
        if os.path.exists(file_path):
            os.remove(file_path)

    # Delete documents from DB
    cursor.execute("DELETE FROM trailer_documents WHERE trailer_number = %s", (trailer_no,))

    # Delete the trailer
    cursor.execute("DELETE FROM trailers WHERE trailer_no = %s;", (trailer_no,))
    if cursor.rowcount == 0:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Trailer not found")

    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Trailer '{trailer_no}' and its documents were deleted successfully"}

#---------------------------------------other_trailer--------------------------------------------
class OtherTrailer(BaseModel):
    trailer_no: str
    owner: str
    company_under: str
    mulkiya_exp: Optional[str] = None
    oman_ins_exp: Optional[str] = None

    @validator('mulkiya_exp', pre=True)
    def format_mulkiya_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')
        return v

    @validator('oman_ins_exp', pre=True)
    def format_insurance_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')
        return v


# Fetch all other trailers
@app.get("/other-trailers", response_model=List[OtherTrailer])
def get_all_other_trailers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_trailer;")
    trailers = cursor.fetchall()
    cursor.close()
    conn.close()
    return trailers

# Get one by trailer number
@app.get("/other-trailers/{trailer_no}", response_model=OtherTrailer)
def get_other_trailer(trailer_no: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_trailer WHERE trailer_no = %s;", (trailer_no,))
    trailer = cursor.fetchone()
    cursor.close()
    conn.close()
    if not trailer:
        raise HTTPException(status_code=404, detail="Trailer not found")
    return trailer

# Add trailer
@app.post("/other-trailers")
def add_other_trailer(trailer: OtherTrailer):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO other_trailer (trailer_no, owner, company_under, mulkiya_exp, oman_ins_exp)
        VALUES (%s, %s, %s, %s, %s)
    """, (trailer.trailer_no, trailer.owner, trailer.company_under, trailer.mulkiya_exp, trailer.oman_ins_exp))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Other trailer added successfully"}

# Update trailer
@app.put("/other-trailers/{trailer_no}")
def update_other_trailer(trailer_no: str, trailer: OtherTrailer):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE other_trailer SET owner=%s, company_under=%s, mulkiya_exp=%s, oman_ins_exp=%s
        WHERE trailer_no=%s
    """, (trailer.owner, trailer.company_under, trailer.mulkiya_exp, trailer.oman_ins_exp, trailer_no))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Trailer not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Other trailer updated successfully"}

# Delete trailer
@app.delete("/other-trailers/{trailer_no}")
def delete_other_trailer(trailer_no: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM other_trailer WHERE trailer_no = %s;", (trailer_no,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Trailer not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Trailer '{trailer_no}' deleted successfully"}

#---------------------------------------clients--------------------------------------------
# Pydantic models
class clients(BaseModel):
    name: str
    address: Optional[str] = None
    tel_no: Optional[int] = None
    po_box: Optional[int] = None
    trn_no: Optional[int] = None
    contact_person: Optional[str] = None
    person_number: Optional[int] = None

#add new client
@app.post("/clients")
def add_client(client: clients):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    INSERT INTO clients (name, address, tel_no, po_box, trn_no, contact_person, person_number)
    VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    values = (client.name, client.address, client.tel_no, client.po_box, client.trn_no, client.contact_person, client.person_number)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Client added successfully!"}

# fetch all
@app.get("/clients", response_model=List[clients])
def get_all_clients():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM clients;")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

#fetch specific
@app.get("/clients/{client_name}", response_model=clients)
def get_client(client_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM clients WHERE name = %s;", (client_name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return result
    else:
        raise HTTPException(status_code=404, detail="Client not found")

#update client
@app.put("/clients/{client_name}")
def update_client(client_name: str, client: clients):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
    UPDATE clients SET name=%s, address=%s, tel_no=%s, po_box=%s, trn_no=%s, contact_person=%s ,person_number=%s
    WHERE name=%s;
    """
    values = (client.name, client.address, client.tel_no, client.po_box, client.trn_no, client.contact_person, client.person_number, client_name)
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Client updated successfully!"}

#delete client
@app.delete("/clients/{client_name}")
def delete_client(client_name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM clients WHERE name = %s;", (client_name,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Client not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Client '{client_name}' deleted successfully"}

#all clients name
@app.get("/clients/names", response_model=List[str])
def get_client_names():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM clients;")
    clients = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()
    return clients

#--------------------------------------maintenance--------------------------------------------------------
# Define one model for creating records (no `id`)
class MaintenanceCreate(BaseModel):
    date: str
    driver_name: Optional[str] = None
    truck_number: Optional[str] = None
    vehicle_under: Optional[str] = None
    maintenance_detail: Optional[str] = None
    credit_card: float
    bank: float
    cash: float
    vat: float
    total: Optional[float] = None
    status: str
    supplier:Optional[str] = None


class Maintenance(BaseModel):
    id: int
    date: str
    driver_name: Optional[str] = None
    truck_number: Optional[str] = None
    vehicle_under: Optional[str] = None
    maintenance_detail: Optional[str] = None
    credit_card: float
    bank: float
    cash: float
    vat: float
    total: Optional[float] = None
    status: str
    supplier:Optional[str] = None

       # Validator to ensure load_date is formatted as a string
    @validator('date', pre=True)
    def format_load_datemain(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v

# Fetch all maintenance records
@app.get("/maintenance", response_model=List[Maintenance])
def get_all_maintenance():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM truckmaintenance;")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records


# Fetch a specific maintenance record by ID
@app.get("/maintenance/{record_id}", response_model=Maintenance)
def get_maintenance_by_id(record_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM truckmaintenance WHERE id = %s;", (record_id,))
    record = cursor.fetchone()
    cursor.close()
    conn.close()
    if not record:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return record


# Add a new maintenance record
@app.post("/maintenance")
def add_maintenance(record: MaintenanceCreate):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO truckmaintenance (
            date, driver_name, truck_number, vehicle_under,
            maintenance_detail, credit_card, bank, cash, vat, status, supplier
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
    """
    values = (
        record.date, record.driver_name, record.truck_number,
        record.vehicle_under, record.maintenance_detail,
        record.credit_card, record.bank, record.cash,
        record.vat, record.status, record.supplier
    )

    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Maintenance record added successfully!"}



# Update an existing maintenance record
@app.put("/maintenance/{record_id}")
def update_maintenance(record_id: int, record: Maintenance):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Calculate total as sum of credit_card + bank + cash + vat
    total = record.credit_card + record.bank + record.cash + record.vat
    
    query = """
        UPDATE truckmaintenance SET
            date=%s, driver_name=%s, truck_number=%s, vehicle_under=%s,
            maintenance_detail=%s, credit_card=%s, bank=%s, cash=%s,
            vat=%s, total=%s, status=%s, supplier=%s
        WHERE id=%s;
    """
    values = (
        record.date, record.driver_name, record.truck_number,
        record.vehicle_under, record.maintenance_detail,
        record.credit_card, record.bank, record.cash,
        record.vat, total, record.status, record.supplier, record_id
    )
    
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Maintenance record updated successfully!"}


@app.delete("/maintenance/{record_id}")
def delete_maintenance(record_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Step 1: Find associated receipt (if any)
    cursor.execute("SELECT url FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (record_id,))
    receipt = cursor.fetchone()

    # Step 2: Delete the receipt file
    if receipt and receipt["url"] and os.path.exists(receipt["url"]):
        os.remove(receipt["url"])

    # Step 3: Delete the receipt DB record
    cursor.execute("DELETE FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (record_id,))

    # Step 4: Delete the maintenance record
    cursor.execute("DELETE FROM truckmaintenance WHERE id = %s;", (record_id,))
    if cursor.rowcount == 0:
        conn.rollback()
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Record not found")

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"Maintenance record with ID {record_id} and associated receipt deleted successfully"}


# # Delete a maintenance record
# @app.delete("/maintenance/{record_id}")
# def delete_maintenance(record_id: int):
#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("DELETE FROM truckmaintenance WHERE id = %s;", (record_id,))
#     if cursor.rowcount == 0:
#         raise HTTPException(status_code=404, detail="Record not found")
#     conn.commit()
#     cursor.close()
#     conn.close()
#     return {"message": f"Record with ID {record_id} deleted successfully"}

#--------------------------------------supplier--------------------------------------------------------

# Pydantic models
class supplier(BaseModel):
    name: str
    tel_no: Optional[int] = None
    contact_person: Optional[str] = None
    phone_no: Optional[int] = None
    about: Optional[str] = None

#add supplier
@app.post("/suppliers")
def add_supplier(supp: supplier):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        INSERT INTO suppliers (name, tel_no, contact_person, phone_no, about)
        VALUES (%s, %s, %s, %s, %s);
    """
    values = (supp.name, supp.tel_no, supp.contact_person, supp.phone_no, supp.about)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Supplier added successfully!"}

#get all supplier
@app.get("/suppliers", response_model=List[supplier])
def get_all_suppliers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM suppliers;")
    suppliers = cursor.fetchall()
    cursor.close()
    conn.close()
    return suppliers

#get supplier by name
@app.get("/suppliers/{name}", response_model=supplier)
def get_supplier(name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM suppliers WHERE name = %s;", (name,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()
    if result:
        return result
    raise HTTPException(status_code=404, detail="Supplier not found")

#update supplier
@app.put("/suppliers/{name}")
def update_supplier(name: str, supp: supplier):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = """
        UPDATE suppliers SET
        name=%s, tel_no=%s, contact_person=%s, phone_no=%s, about=%s
        WHERE name=%s;
    """
    values = (
        supp.name, supp.tel_no, supp.contact_person, supp.phone_no, supp.about, name
    )
    cursor.execute(query, values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Supplier updated successfully!"}

#delete supplier
@app.delete("/suppliers/{name}")
def delete_supplier(name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM suppliers WHERE name = %s;", (name,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Supplier '{name}' deleted successfully!"}

#fetch supplier names
@app.get("/suppliers/names/code", response_model=List[str])
def get_supplier_names():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM suppliers;")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return [row[0] for row in rows]


#--------------------------------------other_owner--------------------------------------------------------
class OtherOwner(BaseModel):
    name: str
    contact: Optional[int] = None
    remarks: Optional[int] = None
    eid: Optional[int] = None


# Get all other owners
@app.get("/other-owners", response_model=List[OtherOwner])
def get_all_other_owners():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_owner;")
    owners = cursor.fetchall()
    cursor.close()
    conn.close()
    return owners

# Get a single owner by name
@app.get("/other-owners/{name}", response_model=OtherOwner)
def get_other_owner(name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM other_owner WHERE name = %s;", (name,))
    owner = cursor.fetchone()
    cursor.close()
    conn.close()
    if not owner:
        raise HTTPException(status_code=404, detail="Other owner not found")
    return owner

# Add a new other owner
@app.post("/other-owners")
def add_other_owner(owner: OtherOwner):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO other_owner (name, contact, remarks, eid)
        VALUES (%s, %s, %s, %s)
    """, (owner.name, owner.contact, owner.remarks, owner.eid))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Other owner added successfully"}

# Update an existing other owner
@app.put("/other-owners/{name}")
def update_other_owner(name: str, owner: OtherOwner):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE other_owner SET contact=%s, remarks=%s, eid=%s WHERE name=%s
    """, (owner.contact, owner.remarks, owner.eid, name))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Other owner not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Other owner updated successfully"}

# Delete an other owner
@app.delete("/other-owners/{name}")
def delete_other_owner(name: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM other_owner WHERE name = %s;", (name,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Other owner not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Other owner '{name}' deleted successfully"}

#--------------------------------------inventory--------------------------------------------------------
class Inventory(BaseModel):
    id: int
    name: str
    supplier: str
    supplier_contact: int
    remarks: Optional[str] = None
    quantity: int


# Get all inventory items
@app.get("/inventory", response_model=List[Inventory])
def get_all_inventory():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM inventory;")
    items = cursor.fetchall()
    cursor.close()
    conn.close()
    return items

# Get single item by ID
@app.get("/inventory/{item_id}", response_model=Inventory)
def get_inventory_item(item_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM inventory WHERE id = %s;", (item_id,))
    item = cursor.fetchone()
    cursor.close()
    conn.close()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

# Add new item
@app.post("/inventory")
def add_inventory(item: Inventory):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO inventory (id, name, supplier, supplier_contact, remarks, quantity)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (item.id, item.name, item.supplier, item.supplier_contact, item.remarks, item.quantity))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Inventory item added successfully"}

# Update inventory item
@app.put("/inventory/{item_id}")
def update_inventory(item_id: int, item: Inventory):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE inventory SET name=%s, supplier=%s, supplier_contact=%s, remarks=%s, quantity=%s
        WHERE id=%s
    """, (item.name, item.supplier, item.supplier_contact, item.remarks, item.quantity, item_id))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Inventory item updated successfully"}

# Delete item
@app.delete("/inventory/{item_id}")
def delete_inventory(item_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM inventory WHERE id = %s;", (item_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Inventory item with ID {item_id} deleted successfully"}

#--------------------------------------investors--------------------------------------------------------
class Investor(BaseModel):
    id: int
    name: int
    contact_no: Optional[int] = None
    details: Optional[str] = None


# Get all investors
@app.get("/investors", response_model=List[Investor])
def get_all_investors():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investors;")
    investors = cursor.fetchall()
    cursor.close()
    conn.close()
    return investors

# Get investor by ID
@app.get("/investors/{investor_id}", response_model=Investor)
def get_investor(investor_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investors WHERE id = %s;", (investor_id,))
    investor = cursor.fetchone()
    cursor.close()
    conn.close()
    if not investor:
        raise HTTPException(status_code=404, detail="Investor not found")
    return investor

# Add new investor
@app.post("/investors")
def add_investor(investor: Investor):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO investors (id, name, contact_no, details)
        VALUES (%s, %s, %s, %s)
    """, (investor.id, investor.name, investor.contact_no, investor.details))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Investor added successfully"}

# Update investor
@app.put("/investors/{investor_id}")
def update_investor(investor_id: int, investor: Investor):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE investors SET name=%s, contact_no=%s, details=%s WHERE id=%s
    """, (investor.name, investor.contact_no, investor.details, investor_id))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Investor not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Investor updated successfully"}

# Delete investor
@app.delete("/investors/{investor_id}")
def delete_investor(investor_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM investors WHERE id = %s;", (investor_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Investor not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Investor with ID {investor_id} deleted successfully"}

#--------------------------------------investor1_aacounts--------------------------------------------------------
class Investor1Account(BaseModel):
    id: int
    investor_id: Optional[int] = None
    trip_id: Optional[int] = None
    fixed_tir_price: Optional[float] = None
    sold_tir_price: Optional[float] = None
    amount_due: Optional[float] = None
    paid: Optional[bool] = False


# Get all records
@app.get("/investor1-accounts", response_model=List[Investor1Account])
def get_all_investor1_accounts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investor1_accounts;")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records

# Get one by ID
@app.get("/investor1-accounts/{record_id}", response_model=Investor1Account)
def get_investor1_account(record_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investor1_accounts WHERE id = %s;", (record_id,))
    record = cursor.fetchone()
    cursor.close()
    conn.close()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

# Add new record
@app.post("/investor1-accounts")
def add_investor1_account(data: Investor1Account):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO investor1_accounts (
            trip_id, fixed_tir_price, sold_tir_price, amount_due, paid
        ) VALUES (%s, %s, %s, %s, %s)
    """, (
        data.trip_id, data.fixed_tir_price,
        data.sold_tir_price, data.amount_due, data.paid
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Investor1 account record added successfully"}

# Update record
@app.put("/investor1-accounts/{record_id}")
def update_investor1_account(record_id: int, data: Investor1Account):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE investor1_accounts SET 
            trip_id=%s, fixed_tir_price=%s, sold_tir_price=%s,
            amount_due=%s, paid=%s
        WHERE id=%s
    """, (
        data.trip_id, data.fixed_tir_price,
        data.sold_tir_price, data.amount_due, data.paid, record_id
    ))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Investor1 account updated successfully"}

# Delete record
@app.delete("/investor1-accounts/{record_id}")
def delete_investor1_account(record_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM investor1_accounts WHERE id = %s;", (record_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Investor1 account with ID {record_id} deleted successfully"}

#--------------------------------------investor2_accounts--------------------------------------------------------
class Investor2Account(BaseModel):
    id: int
    investor_id: Optional[int] = None
    trip_id: Optional[int] = None
    amount_due: Optional[float] = None
    paid: Optional[bool] = False


# Get all records
@app.get("/investor2-accounts", response_model=List[Investor2Account])
def get_all_investor2_accounts():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investor2_accounts;")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records

# Get one by ID
@app.get("/investor2-accounts/{record_id}", response_model=Investor2Account)
def get_investor2_account(record_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM investor2_accounts WHERE id = %s;", (record_id,))
    record = cursor.fetchone()
    cursor.close()
    conn.close()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record

# Add new record
@app.post("/investor2-accounts")
def add_investor2_account(data: Investor2Account):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO investor2_accounts (
            trip_id, amount_due, paid
        ) VALUES (%s, %s, %s)
    """, (
        data.trip_id, data.amount_due, data.paid
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Investor2 account record added successfully"}

# Update record
@app.put("/investor2-accounts/{record_id}")
def update_investor2_account(record_id: int, data: Investor2Account):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE investor2_accounts SET 
            trip_id=%s, amount_due=%s, paid=%s
        WHERE id=%s
    """, (
        data.trip_id, data.amount_due, data.paid, record_id
    ))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Investor2 account updated successfully"}

# Delete record
@app.delete("/investor2-accounts/{record_id}")
def delete_investor2_account(record_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM investor2_accounts WHERE id = %s;", (record_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Record not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Investor2 account with ID {record_id} deleted successfully"}

#--------------------------------------salary--------------------------------------------------------
class Salary(BaseModel):
    id: int
    employee: Optional[str] = None
    month_year: Optional[str] = None  # Format: YYYY-MM
    base_salary: Optional[float] = None
    working_days: Optional[int] = None
    trip_allowance: Optional[float] = None
    visa_deduction: Optional[float] = None
    fine_deduction: Optional[float] = None
    advance_deduction: Optional[float] = None
    net_salary: Optional[float] = None
    generated_at: Optional[str] = None  # Optional override (auto-set by DB)


# Get all salaries
@app.get("/salaries", response_model=List[Salary])
def get_all_salaries():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM salary;")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return records

# Get salary by ID
@app.get("/salaries/{salary_id}", response_model=Salary)
def get_salary(salary_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM salary WHERE id = %s;", (salary_id,))
    record = cursor.fetchone()
    cursor.close()
    conn.close()
    if not record:
        raise HTTPException(status_code=404, detail="Salary record not found")
    return record

#by name
@app.get("/salaries/by-employee/{employee_name}", response_model=List[Salary])
def get_salaries_by_employee(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM salary WHERE employee = %s;", (employee_name,))
    salaries = cursor.fetchall()
    cursor.close()
    conn.close()
    return salaries

#by month-year
@app.get("/salaries/by-month/{month_year}", response_model=List[Salary])
def get_salaries_by_month(month_year: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM salary WHERE month_year = %s;", (month_year,))
    salaries = cursor.fetchall()
    cursor.close()
    conn.close()
    return salaries


# Add salary (manual entry or system generated)
@app.post("/salaries")
def add_salary(data: Salary):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO salary (
            employee, month_year, base_salary, working_days,
            trip_allowance, visa_deduction, fine_deduction,
            advance_deduction, net_salary
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data.employee, data.month_year, data.base_salary,
        data.working_days, data.trip_allowance, data.visa_deduction,
        data.fine_deduction, data.advance_deduction, data.net_salary
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Salary record added successfully"}

# Update salary
@app.put("/salaries/{salary_id}")
def update_salary(salary_id: int, data: Salary):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE salary SET 
            employee=%s, month_year=%s, base_salary=%s, working_days=%s,
            trip_allowance=%s, visa_deduction=%s, fine_deduction=%s,
            advance_deduction=%s, net_salary=%s
        WHERE id=%s
    """, (
        data.employee, data.month_year, data.base_salary,
        data.working_days, data.trip_allowance, data.visa_deduction,
        data.fine_deduction, data.advance_deduction, data.net_salary, salary_id
    ))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Salary record not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Salary updated successfully"}

# Delete salary
@app.delete("/salaries/{salary_id}")
def delete_salary(salary_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM salary WHERE id = %s;", (salary_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Salary record not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Salary record with ID {salary_id} deleted successfully"}

#--------------------------------------fine--------------------------------------------------------
class Fine(BaseModel):
    id: int
    trip_id: Optional[int] = None
    reason: Optional[str] = None
    truck_number: Optional[str] = None
    driver_name: Optional[str] = None
    driver_fault: Optional[bool] = None
    fine_date: Optional[str] = None  # format: 'YYYY-MM-DD'
    amount: float
    payment_status: str

         # Validator to ensure load_date is formatted as a string
    @validator('fine_date', pre=True)
    def format_load_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v


# Get all fines
@app.get("/fines", response_model=List[Fine])
def get_all_fines():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM fines;")
    fines = cursor.fetchall()
    cursor.close()
    conn.close()
    return fines

# Get fine by ID
@app.get("/fines/{fine_id}", response_model=Fine)
def get_fine(fine_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM fines WHERE id = %s;", (fine_id,))
    fine = cursor.fetchone()
    cursor.close()
    conn.close()
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")
    return fine

#by truck number
@app.get("/fines/by-truck/{truck_number}", response_model=List[Fine])
def get_fines_by_truck(truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM fines 
        WHERE truck_number = %s AND driver_fault = 1 AND payment_status= "UNPAID";
    """, (truck_number,))
    fines = cursor.fetchall()
    cursor.close()
    conn.close()
    return fines

#by driver name
@app.get("/fines/by-driver/{driver_name}", response_model=List[Fine])
def get_fines_by_driver(driver_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM fines 
        WHERE driver_name = %s AND driver_fault = 1 AND payment_status= "UNPAID";
    """, (driver_name,))
    fines = cursor.fetchall()
    cursor.close()
    conn.close()
    return fines


#not driver fault
@app.get("/fines/company-fault", response_model=List[Fine])
def get_company_fault_fines():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT * FROM fines 
        WHERE driver_fault = 0 AND payment_status= "UNPAID";
    """)
    fines = cursor.fetchall()
    cursor.close()
    conn.close()
    return fines

# Add new fine
@app.post("/fines")
def add_fine(data: Fine):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO fines (
            trip_id, reason, truck_number, driver_name, driver_fault, fine_date, amount, payment_status
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        data.trip_id, data.reason, data.truck_number, data.driver_name,
        data.driver_fault, data.fine_date, data.amount, data.payment_status
    ))
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Fine added successfully"}

# Update fine
@app.put("/fines/{fine_id}")
def update_fine(fine_id: int, data: Fine):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE fines SET 
            trip_id=%s, reason=%s, truck_number=%s, driver_name=%s,
            driver_fault=%s, fine_date=%s, amount=%s, , payment_status=%s
        WHERE id=%s
    """, (
        data.trip_id, data.reason, data.truck_number, data.driver_name,
        data.driver_fault, data.fine_date, data.amount, data.payment_status, fine_id
    ))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Fine not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Fine updated successfully"}

# Delete fine
@app.delete("/fines/{fine_id}")
def delete_fine(fine_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM fines WHERE id = %s;", (fine_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Fine not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": f"Fine with ID {fine_id} deleted successfully"}

#--------------------------------------trips--------------------------------------------------------
# -------------------------------
# Pydantic Model for Trips
# -------------------------------
class Trip(BaseModel):
    return_load: Optional[bool] = None
    date: Optional[str] = None
    destination_country: str
    service_provider: str
    client: str
    trip_description: Optional[str] = None
    truck_no: Optional[str] = None
    driver: Optional[str] = None
    other_truck_no: Optional[str] = None
    other_driver: Optional[str] = None
    other_driver_contact: Optional[int] = None
    company_rate: int
    driver_rate: int
    diesel: int
    diesel_sold: Optional[int] = None
    advance: Optional[int] = 0
    advance_usage_details: Optional[str] = None
    advance_expense: Optional[float] = None
    trip_rate: Optional[int] = None
    uae_border: Optional[int] = 0
    uae_border_details: Optional[str] = None
    international_border: Optional[int] = 0
    international_border_details: Optional[str] = None
    extra_delivery: Optional[int] = 0
    extra_delivery_details: Optional[str] = None
    driver_extra_rate: Optional[int] = None
    extra_charges: Optional[float] = 0.0
    extra_charges_details: Optional[str] = None
    lpo_no: Optional[str] = None
    dio_no: Optional[str] = None
    tir_no: Optional[str] = None
    tir_price: Optional[int] = None
    investor1_share: Optional[int] = None
    investor2_share: Optional[int] = None
    investor3_share: Optional[int] = None
    investor4_share: Optional[int] = None
    investor5_share: Optional[int] = None
    custom: Optional[float] = None
    paid_by_client: Optional[float] = None
    paid_by_client_details: Optional[str] = None
    receivable_client: Optional[int] = None
    receivable_status: Optional[str] = "UNPAID"
    outsource_payment: Optional[int] = None
    payable_status: Optional[str] = "UNPAID"
    truck_profit: Optional[float] = None
    company_profit: Optional[float] = None
    other_owner: Optional[str] = None
    other_owner_number: Optional[str] = None

             # Validator to ensure load_date is formatted as a string
    @validator('date', pre=True)
    def format_load_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  # Convert to string in 'YYYY-MM-DD' format
        return v

# -------------------------------
# Create Trip
# -------------------------------
@app.post("/trips")
def create_trip(trip: Trip):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = '''
        INSERT INTO trips (
            return_load, date, destination_country, service_provider, client, trip_description,
            truck_no, driver, other_truck_no, other_driver, other_driver_contact, company_rate,
            driver_rate, diesel, diesel_sold, advance, advance_usage_details, advance_expense,
            trip_rate, uae_border, uae_border_details, international_border, international_border_details,
            extra_delivery, extra_delivery_details, driver_extra_rate, extra_charges, extra_charges_details,
            lpo_no, dio_no, tir_no, tir_price, investor1_share, investor2_share, investor3_share,
            investor4_share, investor5_share, custom, paid_by_client, paid_by_client_details,
            receivable_client, receivable_status, outsource_payment, payable_status, truck_profit,
            company_profit, other_owner, other_owner_number
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                  %s, %s, %s)
    '''
    values = tuple(trip.dict().values())
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Trip added successfully"}

# -------------------------------
# Get All Trips
# -------------------------------
@app.get("/trips", response_model=List[dict])
def get_all_trips():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM trips")
    trips = cursor.fetchall()
    cursor.close()
    conn.close()
    return trips

# -------------------------------
# Get Trip By ID
# -------------------------------
@app.get("/trips/{trip_id}", response_model=dict)
def get_trip(trip_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM trips WHERE trip_id = %s", (trip_id,))
    trip = cursor.fetchone()
    cursor.close()
    conn.close()
    if trip:
        return trip
    raise HTTPException(status_code=404, detail="Trip not found")

# -------------------------------
# Update Trip
# -------------------------------
@app.put("/trips/{trip_id}")
def update_trip(trip_id: int, trip: Trip):
    conn = get_db_connection()
    cursor = conn.cursor()
    set_clause = ", ".join([f"{field}=%s" for field in trip.dict().keys()])
    values = tuple(trip.dict().values()) + (trip_id,)
    query = f"""
        UPDATE trips SET {set_clause} WHERE trip_id = %s
    """
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Trip updated successfully"}

# -------------------------------
# Delete Trip
# -------------------------------
@app.delete("/trips/{trip_id}")
def delete_trip(trip_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM trips WHERE trip_id = %s", (trip_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Trip not found")
    conn.commit()
    cursor.close()
    conn.close()
    return {"message": "Trip deleted successfully"}

#--------------------------------------------------------------------------------------------
#------------------------------------------documents-----------------------------------------
#--------------------------------------------------------------------------------------------

#-------------------------------------------documents-employee-------------------------------

# Pydantic model for response
class Document(BaseModel):
    type: str
    url: str
    uploadDate: Optional[str]
    employee_name: str

             # Validator to ensure load_date is formatted as a string
    @validator('uploadDate', pre=True)
    def format_load_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v


# Get all documents for an employee
@app.get("/employees/{employee_name}/documents", response_model=List[Document])
def get_documents(employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employee_documents WHERE employee_name = %s", (employee_name,))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found for this employee")

    return documents

# View/download a document by name
@app.get("/employees/{employee_name}/documents/{type}")
def view_document(employee_name: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT url FROM employee_documents WHERE employee_name = %s and type =%s"
    cursor.execute(query, (employee_name,type))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))

#delete documnet
@app.delete("/employees/{employee_name}/documents/{type}")
def delete_document(employee_name: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get file path first
    cursor.execute(
        "SELECT url FROM employee_documents WHERE employee_name = %s AND type = %s",
        (employee_name, type)
    )
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]

    # Delete file from disk
    if os.path.exists(file_path):
        os.remove(file_path)

    # Delete DB record
    cursor.execute(
        "DELETE FROM employee_documents WHERE employee_name = %s AND type = %s",
        (employee_name, type)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"{type} document deleted for {employee_name}"}

#upload document by type
@app.post("/employees/{employee_name}/documents/{type}/upload", response_model=Document)
def upload_document(employee_name: str, type: str,    file: UploadFile = File(...)):
    # Save the file to a directory
    uploads_dir = "EmployeeDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{employee_name}_{type}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploadDate = datetime.datetime.today().strftime('%Y-%m-%d')

    # Insert into DB
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        INSERT INTO employee_documents (type, url, uploadDate, employee_name)
        VALUES (%s, %s, %s, %s)
    """
    values = (type, file_path, uploadDate, employee_name)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "type": type,
        "url": file_path,
        "uploadDate": uploadDate,
        "employee_name": employee_name
    }

#------------------------------------------------document-trucks-------------------------------------------

# Pydantic model for truck document
class TruckDocument(BaseModel):
    type: str
    url: str
    uploadDate: Optional[str]
    truck_number: str

    @validator('uploadDate', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v


# Get all documents for a truck
@app.get("/trucks/{truck_number}/documents", response_model=List[TruckDocument])
def get_truck_documents(truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM truck_documents WHERE truck_number = %s", (truck_number,))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found for this truck")

    return documents

# View/download a truck document
@app.get("/trucks/{truck_number}/documents/{type}")
def view_truck_document(truck_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT url FROM truck_documents WHERE truck_number = %s and type = %s"
    cursor.execute(query, (truck_number, type))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))

# Delete a truck document
@app.delete("/trucks/{truck_number}/documents/{type}")
def delete_truck_document(truck_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    # Get file path first
    cursor.execute(
        "SELECT url FROM truck_documents WHERE truck_number = %s AND type = %s",
        (truck_number, type)
    )
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]

    # Delete file from disk
    if os.path.exists(file_path):
        os.remove(file_path)

    # Delete DB record
    cursor.execute(
        "DELETE FROM truck_documents WHERE truck_number = %s AND type = %s",
        (truck_number, type)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"{type} document deleted for truck {truck_number}"}

# Upload a truck document
@app.post("/trucks/{truck_number}/documents/{type}/upload", response_model=TruckDocument)
def upload_truck_document(truck_number: str, type: str, file: UploadFile = File(...)):
    uploads_dir = "TruckDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{truck_number}_{type}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploadDate = datetime.datetime.today().strftime('%Y-%m-%d')

    # Insert into DB
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        INSERT INTO truck_documents (type, url, uploadDate, truck_number)
        VALUES (%s, %s, %s, %s)
    """
    values = (type, file_path, uploadDate, truck_number)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "type": type,
        "url": file_path,
        "uploadDate": uploadDate,
        "truck_number": truck_number
    }

#-------------------------------------------------------trailer-documents--------------------------------------------------------------------
class TrailerDocument(BaseModel):
    type: str
    url: str
    uploadDate: Optional[str]
    trailer_number: str

    @validator('uploadDate', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v

# Get all documents for a trailer
@app.get("/trailers/{trailer_number}/documents", response_model=List[TrailerDocument])
def get_trailer_documents(trailer_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM trailer_documents WHERE trailer_number = %s", (trailer_number,))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found for this trailer")

    return documents

# View/download a trailer document
@app.get("/trailers/{trailer_number}/documents/{type}")
def view_trailer_document(trailer_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT url FROM trailer_documents WHERE trailer_number = %s and type = %s"
    cursor.execute(query, (trailer_number, type))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))

# Delete a trailer document
@app.delete("/trailers/{trailer_number}/documents/{type}")
def delete_trailer_document(trailer_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT url FROM trailer_documents WHERE trailer_number = %s AND type = %s",
        (trailer_number, type)
    )
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]

    if os.path.exists(file_path):
        os.remove(file_path)

    cursor.execute(
        "DELETE FROM trailer_documents WHERE trailer_number = %s AND type = %s",
        (trailer_number, type)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"{type} document deleted for trailer {trailer_number}"}

# Upload a trailer document
@app.post("/trailers/{trailer_number}/documents/{type}/upload", response_model=TrailerDocument)
def upload_trailer_document(trailer_number: str, type: str, file: UploadFile = File(...)):
    uploads_dir = "TrailerDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{trailer_number}_{type}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploadDate = datetime.datetime.today().strftime('%Y-%m-%d')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        INSERT INTO trailer_documents (type, url, uploadDate, trailer_number)
        VALUES (%s, %s, %s, %s)
    """
    values = (type, file_path, uploadDate, trailer_number)
    cursor.execute(query, values)
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "type": type,
        "url": file_path,
        "uploadDate": uploadDate,
        "trailer_number": trailer_number
    }

#---------------------------------truckmaint-doc--------------------------------------------------------------
class TruckMaintenanceDocument(BaseModel):
    truck_number: Optional[str]
    url: str
    uploaded_at: Optional[str]
    truck_maintenance_id: int

    @validator('uploaded_at', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v


# Upload document
@app.post("/truck-maintenance/{truck_maintenance_id}/documents/upload", response_model=TruckMaintenanceDocument)
def upload_maintenance_doc(
    truck_maintenance_id: int,
    truck_number: Optional[str] = None,
    file: UploadFile = File(...)
):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

        # Check if a document already exists for this truck_maintenance_id
    cursor.execute("SELECT url FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (truck_maintenance_id,))
    existing_doc = cursor.fetchone()

    # If found, delete the file and the record
    if existing_doc:
        old_file_path = existing_doc["url"]
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
        cursor.execute("DELETE FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (truck_maintenance_id,))
        conn.commit()

    uploads_dir = "TruckMaintenanceDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{truck_maintenance_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploaded_at = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    query = """
        INSERT INTO truckmaintenance_receipts (truck_number, url, uploaded_at, truck_maintenance_id)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(query, (truck_number, file_path, uploaded_at, truck_maintenance_id))
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "truck_number": truck_number,
        "url": file_path,
        "uploaded_at": uploaded_at,
        "truck_maintenance_id": truck_maintenance_id
    }

# Get all documents for a truck_maintenance_id
@app.get("/truck-maintenance/{truck_maintenance_id}/documents", response_model=List[TruckMaintenanceDocument])
def get_docs_by_maintenance_id(truck_maintenance_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (truck_maintenance_id,))
    docs = cursor.fetchall()
    cursor.close()
    conn.close()

    if not docs:
        raise HTTPException(status_code=404, detail="No documents found")

    return docs

# Download document by truck_maintenance_id and filename
@app.get("/truck-maintenance/{truck_maintenance_id}/documents/view")
def download_doc_by_filename(truck_maintenance_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT url FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s",
        (truck_maintenance_id,)
    )
    doc = cursor.fetchone()
    cursor.close()
    conn.close()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = doc["url"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))

# Delete all documents for a truck_maintenance_id
@app.delete("/truck-maintenance/{truck_maintenance_id}/documents")
def delete_docs_by_maintenance_id(truck_maintenance_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (truck_maintenance_id,))
    docs = cursor.fetchall()

    if not docs:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="No documents found")

    for doc in docs:
        if os.path.exists(doc["url"]):
            os.remove(doc["url"])

    cursor.execute("DELETE FROM truckmaintenance_receipts WHERE truck_maintenance_id = %s", (truck_maintenance_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"All documents for truck_maintenance_id {truck_maintenance_id} deleted"}

#----------------------------------------------------fine-document--------------------------------------------------------------
class FineDocument(BaseModel):
    url: str
    uploaded_at: Optional[str]
    fine_id: int

    @validator('uploaded_at', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')
        return v
    
#upload fine
@app.post("/fines/{fine_id}/documents/upload", response_model=FineDocument)
def upload_fine_doc(
    fine_id: int,
    file: UploadFile = File(...)
):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM fine_documents WHERE fine_id = %s", (fine_id,))
    existing_doc = cursor.fetchone()

    if existing_doc:
        old_file_path = existing_doc["url"]
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
        cursor.execute("DELETE FROM fine_documents WHERE fine_id = %s", (fine_id,))
        conn.commit()

    uploads_dir = "FineDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{fine_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploaded_at = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cursor.execute(
        "INSERT INTO fine_documents (url, uploaded_at, fine_id) VALUES (%s, %s, %s)",
        (file_path, uploaded_at, fine_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "url": file_path,
        "uploaded_at": uploaded_at,
        "fine_id": fine_id
    }

#get doc
@app.get("/fines/{fine_id}/documents", response_model=List[FineDocument])
def get_fine_docs(fine_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM fine_documents WHERE fine_id = %s", (fine_id,))
    docs = cursor.fetchall()
    cursor.close()
    conn.close()

    if not docs:
        raise HTTPException(status_code=404, detail="No documents found")

    return docs


#view doc
@app.get("/fines/{fine_id}/documents/view")
def view_fine_doc(fine_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM fine_documents WHERE fine_id = %s", (fine_id,))
    doc = cursor.fetchone()
    cursor.close()
    conn.close()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = doc["url"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))


#delete doc
@app.delete("/fines/{fine_id}/documents")
def delete_fine_docs(fine_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM fine_documents WHERE fine_id = %s", (fine_id,))
    docs = cursor.fetchall()

    if not docs:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="No documents found")

    for doc in docs:
        if os.path.exists(doc["url"]):
            os.remove(doc["url"])

    cursor.execute("DELETE FROM fine_documents WHERE fine_id = %s", (fine_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"All documents for fine_id {fine_id} deleted"}


#----------------------------------------------------salary-documents--------------------------------------------------------------
class SalaryDocument(BaseModel):
    salary_id: int
    url: str
    uploaded_at: Optional[datetime.date]

    @validator('uploaded_at', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v

@app.post("/salaries/{salary_id}/documents", response_model=SalaryDocument)
def upload_salary_document(salary_id: int, file: UploadFile = File(...)):
    uploads_dir = "SalaryDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"salary_{salary_id}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploaded_at = datetime.datetime.today().strftime('%Y-%m-%d')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        INSERT INTO salary_documents (salary_id, url, uploaded_at)
        VALUES (%s, %s, %s)
    """
    cursor.execute(query, (salary_id, file_path, uploaded_at))
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "salary_id": salary_id,
        "url": file_path,
        "uploaded_at": uploaded_at
    }


@app.get("/salaries/{salary_id}/documents", response_model=List[SalaryDocument])
def get_salary_documents(salary_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM salary_documents WHERE salary_id = %s", (salary_id,))
    docs = cursor.fetchall()
    cursor.close()
    conn.close()

    if not docs:
        raise HTTPException(status_code=404, detail="No salary documents found")

    return docs


@app.get("/salaries/{salary_id}/documents/view")
def view_salary_document(salary_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM salary_documents WHERE salary_id = %s", (salary_id,))
    doc = cursor.fetchone()
    cursor.close()
    conn.close()

    if not doc:
        raise HTTPException(status_code=404, detail="Salary document not found")

    file_path = doc["url"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))


@app.delete("/salaries/{salary_id}/documents")
def delete_salary_document(salary_id: int):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM salary_documents WHERE salary_id = %s", (salary_id,))
    doc = cursor.fetchone()

    if not doc:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Salary document not found")

    file_path = doc["url"]
    if os.path.exists(file_path):
        os.remove(file_path)

    cursor.execute("DELETE FROM salary_documents WHERE salary_id = %s", (salary_id,))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"Salary document for salary_id {salary_id} deleted"}

#------------------------------------------------document-other-trucks-------------------------------------------
class OtherTruckDocument(BaseModel):
    type: str
    url: str
    uploadDate: Optional[str]
    other_truck_number: str

    @validator('uploadDate', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v

# Get all documents for an other truck
@app.get("/other-trucks/{other_truck_number}/documents", response_model=List[OtherTruckDocument])
def get_other_truck_documents(other_truck_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM other_trucks_documents WHERE other_truck_number = %s", (other_truck_number,))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found for this other truck")

    return documents


# View/download a document
@app.get("/other-trucks/{other_truck_number}/documents/{type}")
def view_other_truck_document(other_truck_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = "SELECT url FROM other_trucks_documents WHERE other_truck_number = %s AND type = %s"
    cursor.execute(query, (other_truck_number, type))
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))


# Delete a document
@app.delete("/other-trucks/{other_truck_number}/documents/{type}")
def delete_other_truck_document(other_truck_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT url FROM other_trucks_documents WHERE other_truck_number = %s AND type = %s",
                   (other_truck_number, type))
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]
    if os.path.exists(file_path):
        os.remove(file_path)

    cursor.execute("DELETE FROM other_trucks_documents WHERE other_truck_number = %s AND type = %s",
                   (other_truck_number, type))
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"{type} document deleted for other truck {other_truck_number}"}


# Upload a document
@app.post("/other-trucks/{other_truck_number}/documents/{type}/upload", response_model=OtherTruckDocument)
def upload_other_truck_document(other_truck_number: str, type: str, file: UploadFile = File(...)):
    uploads_dir = "OtherTruckDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{other_truck_number}_{type}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploadDate = datetime.datetime.today().strftime('%Y-%m-%d')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO other_trucks_documents (type, url, uploadDate, other_truck_number)
        VALUES (%s, %s, %s, %s)
    """, (type, file_path, uploadDate, other_truck_number))
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "type": type,
        "url": file_path,
        "uploadDate": uploadDate,
        "other_truck_number": other_truck_number
    }

#-------------------------------------------document-other-trailer----------------------------------------------------
class OtherTrailerDocument(BaseModel):
    type: str
    url: str
    uploadDate: Optional[str]
    other_trailer_number: str

    @validator('uploadDate', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v

# Get all documents for an other trailer
@app.get("/other-trailers/{other_trailer_number}/documents", response_model=List[OtherTrailerDocument])
def get_other_trailer_documents(other_trailer_number: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM other_trailers_documents WHERE other_trailer_number = %s", (other_trailer_number,))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found for this other trailer")

    return documents


# View/download a document
@app.get("/other-trailers/{other_trailer_number}/documents/{type}")
def view_other_trailer_document(other_trailer_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT url FROM other_trailers_documents WHERE other_trailer_number = %s AND type = %s",
        (other_trailer_number, type)
    )
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))


# Delete a document
@app.delete("/other-trailers/{other_trailer_number}/documents/{type}")
def delete_other_trailer_document(other_trailer_number: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT url FROM other_trailers_documents WHERE other_trailer_number = %s AND type = %s",
        (other_trailer_number, type)
    )
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]
    if os.path.exists(file_path):
        os.remove(file_path)

    cursor.execute(
        "DELETE FROM other_trailers_documents WHERE other_trailer_number = %s AND type = %s",
        (other_trailer_number, type)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"{type} document deleted for other trailer {other_trailer_number}"}


# Upload a document
@app.post("/other-trailers/{other_trailer_number}/documents/{type}/upload", response_model=OtherTrailerDocument)
def upload_other_trailer_document(other_trailer_number: str, type: str, file: UploadFile = File(...)):
    uploads_dir = "OtherTrailerDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{other_trailer_number}_{type}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploadDate = datetime.datetime.today().strftime('%Y-%m-%d')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO other_trailers_documents (type, url, uploadDate, other_trailer_number)
        VALUES (%s, %s, %s, %s)
    """, (type, file_path, uploadDate, other_trailer_number))
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "type": type,
        "url": file_path,
        "uploadDate": uploadDate,
        "other_trailer_number": other_trailer_number
    }

#-----------------------------------------documents-other-employee----------------------------------------------------------------
class OtherEmployeeDocument(BaseModel):
    type: str
    url: str
    uploadDate: Optional[str]
    other_employee_name: str

    @validator('uploadDate', pre=True)
    def format_upload_date(cls, v):
        if isinstance(v, datetime.date):
            return v.strftime('%d-%m-%Y')  
        return v

# Get all documents for an other employee
@app.get("/other-employees/{other_employee_name}/documents", response_model=List[OtherEmployeeDocument])
def get_other_employee_documents(other_employee_name: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM other_employee_documents WHERE other_employee_name = %s", (other_employee_name,))
    documents = cursor.fetchall()

    cursor.close()
    conn.close()

    if not documents:
        raise HTTPException(status_code=404, detail="No documents found for this other employee")

    return documents


# View/download a specific document
@app.get("/other-employees/{other_employee_name}/documents/{type}")
def view_other_employee_document(other_employee_name: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT url FROM other_employee_documents WHERE other_employee_name = %s AND type = %s",
        (other_employee_name, type)
    )
    result = cursor.fetchone()

    cursor.close()
    conn.close()

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found on server")

    return FileResponse(path=file_path, filename=os.path.basename(file_path))


# Delete a document
@app.delete("/other-employees/{other_employee_name}/documents/{type}")
def delete_other_employee_document(other_employee_name: str, type: str):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT url FROM other_employee_documents WHERE other_employee_name = %s AND type = %s",
        (other_employee_name, type)
    )
    result = cursor.fetchone()

    if not result:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = result["url"]
    if os.path.exists(file_path):
        os.remove(file_path)

    cursor.execute(
        "DELETE FROM other_employee_documents WHERE other_employee_name = %s AND type = %s",
        (other_employee_name, type)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return {"message": f"{type} document deleted for other employee {other_employee_name}"}


# Upload a document
@app.post("/other-employees/{other_employee_name}/documents/{type}/upload", response_model=OtherEmployeeDocument)
def upload_other_employee_document(other_employee_name: str, type: str, file: UploadFile = File(...)):
    uploads_dir = "OtherEmployeeDocs"
    os.makedirs(uploads_dir, exist_ok=True)

    file_path = os.path.join(uploads_dir, f"{other_employee_name}_{type}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    uploadDate = datetime.datetime.today().strftime('%Y-%m-%d')

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO other_employee_documents (type, url, uploadDate, other_employee_name)
        VALUES (%s, %s, %s, %s)
    """, (type, file_path, uploadDate, other_employee_name))
    conn.commit()
    cursor.close()
    conn.close()

    return {
        "type": type,
        "url": file_path,
        "uploadDate": uploadDate,
        "other_employee_name": other_employee_name
    }
