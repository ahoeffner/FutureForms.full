/*
  MIT License

  Copyright © 2024 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Field } from "./Field.js";


/**
 * The Record class represents a record of data.
 * Normally connected to a source
 */
export class Record
{
   private fields$:Map<string,Field> =
      new Map<string,Field>();


   /**
    * Sets the validation status
    * @returns Itself
    */
   public setValidated() : Record
   {
      for (let [_name,field] of this.fields$)
         field.setValidated();

      return(this);
   }


   /**
    * @returns Whether the field is validated
    */
   public isValidated() : boolean
   {
      for (let [_name,field] of this.fields$)
      {
         if (!field.isValidated())
            return(false);
      }

      return(true);
   }


   /**
    * @param field : The field or name of field
    * @returns The field
    */
   public addField(field:string, value?:any) : Field
   {
      let name:string = field.toLowerCase();

      let fld:Field = new Field(field,value);
      this.fields$.set(name,fld);

      return(fld);
   }


   /**
    * @param field : The field or name of field
    * @returns Itself
    */
   public deleteField(field:Field|string) : Record
   {
      if (field instanceof Field)
      {
         this.fields$.delete(field.name.toLowerCase());
         return(this);
      }

      this.fields$.delete(field.toLowerCase());
      return(this);
   }


   /**
    * @param field Name of field
    * @returns The field
    */
   public getField(field:string) : Field
   {
      let name:string = field.toLowerCase();
      return(this.fields$.get(name));
   }


	/**
	 *
	 * If the field does not exist, it will be created.
	 * @param field : Name of field
	 * @param value : Value to set
	 * @description This method sets the value of a field in the record.
	 * @returns Itself
	 */
	public setValue(field:string, value:any) : Record
	{
		let name:string = field.toLowerCase();
		let fld:Field = this.fields$.get(name);

		if (fld) fld.setValue(value);
		else fld = this.addField(name,value);

		return(this);
	}
}