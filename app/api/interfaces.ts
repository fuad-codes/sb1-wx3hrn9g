import { type } from "os"

export interface TripRecord {
  trip_id: number
  load_date: string
  return_load: number
  company_truck: number
  truck_number: string
  driver: string
  company: string
  company_rate: number
  driver_rate: number
  extra_delivery: number
  advance: number
  load_from: string
  unload_to: string
  weight: string
  diesel_cost: number
  trip_rate: number
  gp_toll: number
  advance_expenses: number
  other_exp: number
  total_exps: number
  truck_revenue: number
  company_revenue: number
}

export interface BaseRecord {
  id: string
  date: string
  driver_name: string
  truck_number: string
  vehicle_under: string
  amount: number
  details: string
  status: 'pending' | 'paid' | 'overdue'
  country: 'oman' | 'saudi' | 'qatar' | 'kuwait' | 'bahrain' | 'jordan'
}

export interface VisaRecord extends BaseRecord {
  visa_type: string
  expiry_date: string
  processing_fee: number
}

export interface FineRecord extends BaseRecord {
  fine_type: string
  due_date: string
  penalty_amount: number
}

export interface InsuranceRecord extends BaseRecord {
  insurance_type: string
  policy_number: string
  expiry_date: string
  coverage_amount: number
}

export interface IncomeRecord {
  id: string
  date: string
  category: 'trip' | 'rental' | 'other'
  description: string
  amount: number
  source: string
  reference_no?: string
  payment_method: 'cash' | 'bank' | 'cheque'
  status: 'pending' | 'completed'
}

export interface ExpenseRecord {
  id: string
  date: string
  category: 'maintenance' | 'fuel' | 'salary' | 'visa' | 'insurance' | 'other'
  description: string
  amount: number
  recipient: string
  reference_no?: string
  payment_method: 'cash' | 'bank' | 'cheque'
  status: 'pending' | 'completed'
}

export interface ProfitRecord {
  id: string
  month: string
  year: number
  total_income: number
  total_expenses: number
  net_profit: number
  details: {
    income_breakdown: {
      trips: number
      rental: number
      other: number
    }
    expense_breakdown: {
      maintenance: number
      fuel: number
      salary: number
      visa: number
      insurance: number
      other: number
    }
  }
}

export interface InvestorShareRecord {
  id: string
  investor_name: string
  share_percentage: number
  month: string
  year: number
  profit_share: number
  payment_status: 'pending' | 'paid'
  payment_date?: string
  payment_method?: 'cash' | 'bank' | 'cheque'
  reference_no?: string
}

export interface TIRSoldRecord {
  id: string
  tir_number: string
  date: string
  buy_price: number
  sell_price: number
  profit: number
  buyer: string
  payment_method: 'cash' | 'bank' | 'cheque'
  payment_status: 'pending' | 'completed'
  reference_no?: string
  remarks?: string
}

export interface TIRRecord {
  id: string
  number: string
  issue_date: string
  expiry_date: string
  truck_number: string
  driver_name: string
  status: 'active' | 'expired' | 'pending'
  country: string
  customs_office: string
  remarks?: string
}

export interface PartRecord {
  id: string
  name: string
  part_number: string
  category: 'engine' | 'transmission' | 'brake' | 'electrical' | 'suspension' | 'other'
  quantity: number
  unit_price: number
  supplier: string
  location: string
  minimum_stock: number
  last_purchase_date?: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

export interface Employee {
  employee: string
  refered_as: string | null
  designation: string | null
  contact_no: number | null
  whatsapp_no: number | null
  salary: number
  visa_outstanding: number
  advance_avl: number
  visa_under: string
  visa_exp: string | null
  nationality: string
  eid: number | null
  health_ins_exp: string | null
  emp_ins_exp: string | null
  license_exp: string | null
}

export interface OutsideOwner {
  name: string
  contact_person: string | null
  phone_number: number | null
  whatsapp_number: number | null
  address: string | null
  remarks: string | null
}

export interface OutsideEmployee {
  employee: string
  owner: string
  refered_as: string | null
  designation: string | null
  contact_no: number | null
  whatsapp_no: number | null
  visa_under: string
  visa_exp: string | null
  nationality: string
  eid: number | null
  health_ins_exp: string | null
  emp_ins_exp: string | null
  license_exp: string | null
}

export interface OutsideTruck {
  truck_number: string
  owner: string
  driver: string | null
  year: number | null
  vehicle_under: string
  trailer_no: number | null
  country: string
  mulkiya_exp: string | null
  ins_exp: string | null
}

export interface OutsideTrailer {
  trailer_no: string
  owner: string
  company_under: string
  mulkiya_exp: string | null
  oman_ins_exp: string | null
}