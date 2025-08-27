import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Coordinates { 'x' : number, 'y' : number, 'z' : number }
export interface Dimensions {
  'height' : number,
  'width' : number,
  'depth' : number,
}
export interface LandInfo {
  'id' : bigint,
  'owner' : Principal,
  'metadata' : [] | [LandMetadata],
  'description' : string,
  'last_updated' : bigint,
  'created_at' : bigint,
  'land_type' : LandType,
  'dimensions' : Dimensions,
  'coordinates' : Coordinates,
}
export interface LandMetadata {
  'utilities' : Array<string>,
  'access_roads' : Array<string>,
  'environment' : [] | [string],
  'special_features' : Array<string>,
}
export interface LandRegistration {
  'metadata' : [] | [LandMetadata],
  'description' : string,
  'land_type' : LandType,
  'dimensions' : Dimensions,
  'coordinates' : Coordinates,
}
export type LandRegistryError = { 'InvalidCoordinates' : null } |
  { 'OwnershipError' : null } |
  { 'InvalidInput' : null } |
  { 'LandNotForSale' : null } |
  { 'Unauthorized' : null } |
  { 'LandNotFound' : null } |
  { 'InvalidDimensions' : null } |
  { 'InsufficientFunds' : null } |
  { 'LandAlreadyExists' : null };
export type LandRegistryResult = { 'Ok' : bigint } |
  { 'Err' : LandRegistryError };
export type LandRegistryResult_1 = { 'Ok' : null } |
  { 'Err' : LandRegistryError };
export interface LandStatistics {
  'lands_for_sale' : bigint,
  'average_price' : [] | [bigint],
  'total_owners' : bigint,
  'total_transactions' : bigint,
  'total_lands' : bigint,
}
export type LandType = { 'Agricultural' : null } |
  { 'Commercial' : null } |
  { 'Entertainment' : null } |
  { 'Mixed' : null } |
  { 'Residential' : null } |
  { 'Industrial' : null };
export interface MarketplaceListing {
  'seller' : Principal,
  'land_info' : LandInfo,
  'price' : bigint,
  'land_id' : bigint,
  'listed_at' : bigint,
}
export interface SearchFilters {
  'features' : [] | [Array<string>],
  'min_area' : [] | [number],
  'coordinates_range' : [] | [[Coordinates, Coordinates]],
  'land_type' : [] | [LandType],
  'max_price' : [] | [bigint],
  'min_price' : [] | [bigint],
}
export interface TransactionRecord {
  'to' : Principal,
  'transaction_type' : TransactionType,
  'from' : Principal,
  'timestamp' : bigint,
  'price' : [] | [bigint],
  'land_id' : bigint,
}
export type TransactionType = { 'Registration' : null } |
  { 'Sale' : null } |
  { 'Transfer' : null };
export interface _SERVICE {
  'add_admin' : ActorMethod<[Principal], LandRegistryResult_1>,
  'backup_lands' : ActorMethod<[], Array<LandInfo>>,
  'buy_land' : ActorMethod<[bigint], LandRegistryResult_1>,
  'get_all_lands' : ActorMethod<[], Array<LandInfo>>,
  'get_land' : ActorMethod<[bigint], [] | [LandInfo]>,
  'get_land_owner' : ActorMethod<[bigint], [] | [Principal]>,
  'get_land_statistics' : ActorMethod<[], LandStatistics>,
  'get_lands_by_owner' : ActorMethod<[Principal], Array<LandInfo>>,
  'get_lands_for_sale_by_type' : ActorMethod<
    [LandType],
    Array<MarketplaceListing>
  >,
  'get_lands_near_coordinates' : ActorMethod<
    [Coordinates, number],
    Array<LandInfo>
  >,
  'get_marketplace_listing' : ActorMethod<[bigint], [] | [MarketplaceListing]>,
  'get_marketplace_listings' : ActorMethod<[], Array<MarketplaceListing>>,
  'get_next_land_id' : ActorMethod<[], bigint>,
  'get_price_history' : ActorMethod<[bigint], Array<[bigint, bigint]>>,
  'get_total_supply' : ActorMethod<[], bigint>,
  'get_transaction_history' : ActorMethod<
    [[] | [bigint]],
    Array<TransactionRecord>
  >,
  'get_user_transactions' : ActorMethod<[Principal], Array<TransactionRecord>>,
  'is_admin' : ActorMethod<[Principal], boolean>,
  'list_for_sale' : ActorMethod<[bigint, bigint], LandRegistryResult_1>,
  'register_land' : ActorMethod<[LandRegistration], LandRegistryResult>,
  'remove_from_sale' : ActorMethod<[bigint], LandRegistryResult_1>,
  'remove_land' : ActorMethod<[bigint], LandRegistryResult_1>,
  'restore_lands' : ActorMethod<[Array<LandInfo>], LandRegistryResult_1>,
  'search_by_coordinates' : ActorMethod<
    [Coordinates, Coordinates],
    Array<LandInfo>
  >,
  'search_lands' : ActorMethod<[SearchFilters], Array<LandInfo>>,
  'search_marketplace' : ActorMethod<
    [SearchFilters],
    Array<MarketplaceListing>
  >,
  'transfer_land' : ActorMethod<[bigint, Principal], LandRegistryResult_1>,
  'update_land_metadata' : ActorMethod<
    [bigint, LandMetadata],
    LandRegistryResult_1
  >,
  'verify_land_ownership' : ActorMethod<[bigint, Principal], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
