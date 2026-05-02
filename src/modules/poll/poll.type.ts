import { Document, Model, Types } from 'mongoose';

export type TPollOption = {
  text: string;
  votes: number;
  voters: Types.ObjectId[]; // Track who voted for this option
};

export type TPollVote = {
  user?: Types.ObjectId;
  guest_id?: string; // For anonymous voting
  option_index: number;
  voted_at: Date;
};

export type TPollResult = {
  text: string;
  votes: number;
  percentage: number | string;
};

export type TPoll = {
  news?: Types.ObjectId; // Optional: Poll can be standalone or attached to news
  created_by: Types.ObjectId;
  title: string;
  description?: string;
  options: TPollOption[];

  // Poll Settings
  allow_multiple_votes: boolean; // Allow selecting multiple options
  max_votes: number; // Max options user can select (if multiple votes allowed)
  allow_anonymous: boolean; // Allow voting without login
  show_results_before_vote: boolean; // Show results before voting
  randomize_options: boolean; // Randomize option order to reduce bias

  // Timing
  start_date: Date;
  end_date?: Date;
  is_active: boolean;

  // Tracking
  total_votes: number;
  unique_voters: number;
  votes: TPollVote[]; // Detailed vote tracking

  // Metadata
  tags: string[];
  category?: Types.ObjectId;
  is_featured: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type TPollDocument = TPoll &
  Document & {
    softDelete(): Promise<TPollDocument>;
    status: string;
    results: TPollResult[];
  };

export type TPollModel = Model<TPollDocument> & {
  isPollExist(_id: string): Promise<TPollDocument | null>;
  getActivePolls(): Promise<TPollDocument[] | null>;
  getFeaturedPolls(limit: number): Promise<TPollDocument[] | null>;
  hasUserVoted(pollId: string, userId: string): Promise<boolean>;
};
