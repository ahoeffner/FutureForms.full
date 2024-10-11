/*
  MIT License

  Copyright © 2023 Alex Høffner

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
import { From } from "./From.js";
import { Foreach } from "./Foreach.js";
import { Component } from "./Component.js";
import { Class } from '../../public/Class.js';


export class TagLibrary
{
   private static tags$:Map<string,Tag> = TagLibrary.inittags();
   private static attrs$:Map<string,Tag> = TagLibrary.initattrs();


   /**
    * Initialize the default tags
    */
   private static inittags() : Map<string,Tag>
   {
      //let tag:Tag = null;
      let tags:Map<string,Tag> = new Map<string,Tag>();
      return(tags);
   }


   /**
    * Initialize the default attributes
    */
   private static initattrs() : Map<string,Tag>
   {
      let tag:Tag = null;
      let tags:Map<string,Tag> = new Map<string,Tag>();

      tag = new From();
      tags.set(tag.identifier?.toLowerCase(),tag);

      tag = new Foreach();
      tags.set(tag.identifier?.toLowerCase(),tag);

      tag = new Component();
      tags.set(tag.identifier?.toLowerCase(),tag);

      return(tags);
   }


   /**
    *
    * @param tag The identifier
    * @returns The tag
    */
   public static getCustomTag(tag:string) : Tag
   {
      return(TagLibrary.tags$.get(tag?.toLowerCase()));
   }


   /**
    * @param tag The custom tag
    */
   public static addCustomTag(tag:Class<Tag>) : void
   {
      let impl:Tag = new tag();
      TagLibrary.tags$.set(impl.identifier?.toLowerCase(),impl);
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
      TagLibrary.tags$.set(identifier?.toLowerCase(),impl);
   }


   /**
    *
    * @param tag The identifier
    * @returns The tag
    */
   public static getCustomAttribute(tag:string) : Tag
   {
      return(TagLibrary.attrs$.get(tag.toLowerCase()));
   }


   /**
    * @param tag The custom tag
    */
   public static addCustomAttribute(tag:Class<Tag>) : void
   {
      let impl:Tag = new tag();
      TagLibrary.attrs$.set(impl.identifier?.toLowerCase(),impl);
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
      TagLibrary.attrs$.set(identifier?.toLowerCase(),impl);
   }
}