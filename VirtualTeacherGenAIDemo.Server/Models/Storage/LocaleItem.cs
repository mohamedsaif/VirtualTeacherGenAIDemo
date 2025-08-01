﻿using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using VirtualTeacherGenAIDemo.Server.Options;
using VirtualTeacherGenAIDemo.Server.Storage;

namespace VirtualTeacherGenAIDemo.Server.Models.Storage
{
    public class LocaleItem:  IStorageEntity
    {
        [Required, NotEmptyOrWhitespace]
        public string Id { get; set; } = string.Empty;

        [Required, NotEmptyOrWhitespace]
        public string Lang { get; set; } = string.Empty; // example en-US etc..

        [Required, NotEmptyOrWhitespace]
        public string Key { get; set; } = string.Empty; //MenuPracticeTitle

        [Required, NotEmptyOrWhitespace]
        public string Value { get; set; } = string.Empty; //New Learning Session

        [JsonIgnore]
        public string Partition => Lang;

    }
}
