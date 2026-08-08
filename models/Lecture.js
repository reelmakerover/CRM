const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

function extractYoutubeId(url) {
  if (!url) return '';
  // Match standard, share, embed, or shorts youtube links
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

const Lecture = sequelize.define('Lecture', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  videoUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  youtubeId: {
    type: DataTypes.STRING,
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: (lecture) => {
      lecture.youtubeId = extractYoutubeId(lecture.videoUrl);
    },
    beforeUpdate: (lecture) => {
      lecture.youtubeId = extractYoutubeId(lecture.videoUrl);
    }
  }
});

module.exports = Lecture;
