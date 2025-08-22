import { Common } from "src/modules/common/entities/common.entity";
import { Entity, JoinColumn, OneToMany } from "typeorm";
import { Employee } from "./employee.entity";

@Entity({name: "common"})
export class EmployeeStatus extends Common {
  @OneToMany(() => Employee, employee => employee.status)
  @JoinColumn({ name: 'id' })
  public employees: Promise<Employee[]>
}