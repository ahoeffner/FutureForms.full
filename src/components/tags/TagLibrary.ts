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

import { Tag } from "./Tag.js";
import { Foreach } from "./Foreach.js";
import { Component } from "./Component.js";
import { Class } from '../../public/Class.js';
import { Field } from "./Field.js";


export class TagLibrary
{
   private static tags$:Map<string,Class<Tag>> = TagLibrary.inittags();
   private static attrs$:Map<string,Class<Tag>> = TagLibrary.initattrs();


   /**
    * Initialize the default tags
    */
   private static inittags() : Map<string,Class<Tag>>
   {
      let tags:Map<string,Class<Tag>> = new Map<string,Class<Tag>>();
      return(tags);
   }


   /**
    * Initialize the default attributes
    */
   private static initattrs() : Map<string,Class<Tag>>
   {
      let tag:Tag = null;
      let tags:Map<string,Class<Tag>> = new Map<string,Class<Tag>>();

      tag = new Field();
      tags.set(tag.identifier?.toLowerCase(),Field);

      tag = new Foreach();
      tags.set(tag.identifier?.toLowerCase(),Foreach);

      tag = new Component();
      tags.set(tag.identifier?.toLowerCase(),Component);

      return(tags);
   }


   /**
    *
    * @param tag The identifier
    * @returns The tag
    */
   public static getCustomTag(tag:string) : Class<Tag>
   {
      return(TagLibrary.tags$.get(tag?.toLowerCase()));
   }


   /**
    * @param tag The custom tag
    */
   public static addCustomTag(tag:Class<Tag>) : void
   {
      let impl:Tag = new tag();
      TagLibrary.tags$.set(impl.identifier?.toLowerCase(),tag);
   }


   /**
    * @param tag The custom tag
    */
   public static removeCustomTag(tag:Class<Tag>) : void
   {
      let impl:Tag = new tag();
      TagLibrary.tags$.delete(impl.identifier?.toLowerCase());
   }


   /**
    * @param tag The custom tag
    */
   public static renameCustomTag(tag:Class<Tag>, identifier:string) : void
   {
      let impl:Tag = new tag();
      TagLibrary.tags$.delete(impl.identifier?.toLowerCase());
      TagLibrary.tags$.set(identifier?.toLowerCase(),tag);
   }


   /**
    *
    * @param tag The identifier
    * @returns The tag
    */
   public static getCustomAttribute(tag:string) : Class<Tag>
   {
      return(TagLibrary.attrs$.get(tag.toLowerCase()));
   }


   /**
    * @param tag The custom tag
    */
   public static addCustomAttribute(tag:Class<Tag>) : void
   {
      let impl:Tag = new tag();
      TagLibrary.attrs$.set(impl.identifier?.toLowerCase(),tag);
   }


   /**
    * @param tag The custom tag
    */
   public static removeCustomAttribute(tag:Class<Tag>) : void
   {
      let impl:Tag = new tag();
      TagLibrary.attrs$.delete(impl.identifier?.toLowerCase());
   }


   /**
    * @param tag The custom tag
    */
   public static renameCustomAttribute(tag:Class<Tag>, identifier:string) : void
   {
      let impl:Tag = new tag();
      TagLibrary.attrs$.delete(impl.identifier?.toLowerCase());
      TagLibrary.attrs$.set(identifier?.toLowerCase(),tag);
   }
}